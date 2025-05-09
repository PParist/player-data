import { Injectable, Logger } from '@nestjs/common';
import {
  SQS,
  SendMessageCommand,
  SendMessageBatchCommand,
  CreateQueueCommand,
  GetQueueUrlCommand,
  SendMessageCommandOutput,
  SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
import {
  MessageProducerPort,
  MessageOptions,
  BatchMessage,
  BatchMessageResponse,
} from '../ports/message-producer.port';

export interface SQSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  isFifo?: boolean;
  queueUrlPrefix?: string;
}

@Injectable()
export class SQSProducerAdapter implements MessageProducerPort {
  private client: SQS;
  private queueUrls: Map<string, string> = new Map();
  private readonly logger = new Logger(SQSProducerAdapter.name);

  constructor(private readonly config: SQSConfig) {}

  async init(): Promise<void> {
    try {
      this.client = new SQS({
        region: this.config.region,
        credentials:
          this.config.accessKeyId && this.config.secretAccessKey
            ? {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
              }
            : undefined,
      });
      this.logger.log('Connected to AWS SQS');
    } catch (error) {
      this.logger.error(`Failed to connect to AWS SQS: ${error.message}`);
      throw error;
    }
  }

  async sendMessage<T>(
    destination: string,
    message: T,
    options?: MessageOptions,
  ) {
    try {
      const queueUrl = await this.getQueueUrl(destination);
      const messageBody = JSON.stringify(message);

      const params: any = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
        MessageAttributes: this.convertHeadersToMessageAttributes(
          options?.headers,
        ),
      };

      // SQS standard queues support DelaySeconds parameter
      if (options?.delay && !this.config.isFifo) {
        params.DelaySeconds = options.delay;
      }

      // เพิ่มพารามิเตอร์สำหรับ FIFO queue
      if (this.config.isFifo) {
        params.MessageGroupId = options?.groupId || 'default';
        if (options?.deduplicationId) {
          params.MessageDeduplicationId = options.deduplicationId;
        }
      }

      const command = new SendMessageCommand(params);
      const result: SendMessageCommandOutput = await this.client.send(command);

      return {
        id: result.MessageId || uuidv4(),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send message to ${destination}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendBatch<T>(
    destination: string,
    messages: BatchMessage<T>[], // แก้จาก any[] เป็น BatchMessage<T>[]
  ): Promise<BatchMessageResponse[]> {
    try {
      const queueUrl = await this.getQueueUrl(destination);
      const results: BatchMessageResponse[] = [];

      // SQS batch processing สามารถทำได้สูงสุด 10 messages ต่อครั้ง
      const batchSize = 10;

      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const entries: SendMessageBatchRequestEntry[] = batch.map(
          (msg, index) => {
            const entry: any = {
              Id: msg.id || `msg-${index}-${Date.now()}`,
              MessageBody: JSON.stringify(msg.payload),
              MessageAttributes: this.convertHeadersToMessageAttributes(
                msg.options?.headers,
              ),
            };

            // Standard queues support DelaySeconds parameter
            if (msg.options?.delay && !this.config.isFifo) {
              entry.DelaySeconds = msg.options.delay;
            }

            // เพิ่มพารามิเตอร์สำหรับ FIFO queue
            if (this.config.isFifo) {
              entry.MessageGroupId = msg.options?.groupId || 'default';
              if (msg.options?.deduplicationId) {
                entry.MessageDeduplicationId = msg.options.deduplicationId;
              }
            }

            return entry;
          },
        );

        const command = new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        });

        const response = await this.client.send(command);

        // Process successful messages
        if (response.Successful) {
          response.Successful.forEach((success) => {
            results.push({
              id: success.Id,
              success: true,
              messageId: success.MessageId,
            });
          });
        }

        // Process failed messages
        if (response.Failed) {
          response.Failed.forEach((failure) => {
            results.push({
              id: failure.Id,
              success: false,
              error: new Error(`${failure.Code}: ${failure.Message}`),
            });
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to send batch messages to ${destination}: ${error.message}`,
      );
      throw error;
    }
  }

  private async getQueueUrl(queueName: string): Promise<string> {
    // ตรวจสอบว่ามี URL ใน cache หรือไม่
    if (this.queueUrls.has(queueName)) {
      return this.queueUrls.get(queueName);
    }

    // เพิ่ม .fifo ต่อท้าย queue name สำหรับ FIFO queues
    const fullQueueName =
      this.config.isFifo && !queueName.endsWith('.fifo')
        ? `${queueName}.fifo`
        : queueName;

    try {
      // พยายามดึง queue URL
      const command = new GetQueueUrlCommand({
        QueueName: fullQueueName,
      });

      const response = await this.client.send(command);
      const queueUrl = response.QueueUrl;

      // บันทึก URL ลงใน cache
      if (queueUrl) {
        this.queueUrls.set(queueName, queueUrl);
        return queueUrl;
      }

      throw new Error(`Failed to get queue URL for ${fullQueueName}`);
    } catch (error) {
      // ถ้า queue ไม่มีอยู่ ให้สร้างใหม่
      if (error.$metadata?.httpStatusCode === 400) {
        return this.createQueue(fullQueueName);
      }

      throw error;
    }
  }

  private async createQueue(queueName: string): Promise<string> {
    try {
      const attributes: any = {};

      // ตั้งค่า attributes สำหรับ FIFO queue
      if (this.config.isFifo) {
        attributes.FifoQueue = 'true';
        attributes.ContentBasedDeduplication = 'false';
      }

      const command = new CreateQueueCommand({
        QueueName: queueName,
        Attributes: attributes,
      });

      const response = await this.client.send(command);
      const queueUrl = response.QueueUrl;

      if (queueUrl) {
        this.queueUrls.set(queueName, queueUrl);
        this.logger.log(`Created SQS queue: ${queueName}`);
        return queueUrl;
      }

      throw new Error(`Failed to create queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Error creating queue ${queueName}: ${error.message}`);
      throw error;
    }
  }

  private convertHeadersToMessageAttributes(headers?: Record<string, string>) {
    if (!headers) return {};

    const messageAttributes = {};

    Object.entries(headers).forEach(([key, value]) => {
      messageAttributes[key] = {
        DataType: 'String',
        StringValue: value,
      };
    });

    return messageAttributes;
  }
}
