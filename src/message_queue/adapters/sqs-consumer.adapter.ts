import { Injectable, Logger } from '@nestjs/common';
import {
  SQS,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
  CreateQueueCommand,
  GetQueueUrlCommand,
  SetQueueAttributesCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
import {
  MessageConsumerPort,
  MessageHandler,
  ConsumerOptions,
  MessageMetadata,
} from '../ports/message-consumer.port';

export interface SQSConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  prefetchCount?: number;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  visibilityTimeout?: number;
  waitTimeSeconds?: number;
  isFifo?: boolean;
  queueUrlPrefix?: string;
}

@Injectable()
export class SQSConsumerAdapter implements MessageConsumerPort {
  private client: SQS;
  private readonly logger = new Logger(SQSConsumerAdapter.name);
  private activeConsumers: Map<
    string,
    {
      queueUrl: string;
      running: boolean;
      pollingInterval?: NodeJS.Timeout;
    }
  > = new Map();
  private queueUrls: Map<string, string> = new Map();

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

  async startConsumer<T = any>(
    destination: string,
    handler: MessageHandler<T>,
    options?: ConsumerOptions,
  ): Promise<string> {
    try {
      // SQS ใช้การ polling ไม่ใช่ push model เหมือน RabbitMQ
      const consumerId = uuidv4();
      const queueUrl = await this.getQueueUrl(destination);

      // ตั้งค่า Dead Letter Queue ถ้ามีการระบุ
      if (options?.deadLetterQueue) {
        await this.setupDeadLetterQueue(
          queueUrl,
          options.deadLetterQueue,
          options.retryCount || 3,
        );
      }

      // Polling interval (default 1 second)
      const pollingInterval = 1000;

      // เริ่มการ polling messages
      const interval = setInterval(async () => {
        if (
          !this.activeConsumers.has(consumerId) ||
          !this.activeConsumers.get(consumerId).running
        ) {
          return;
        }

        try {
          await this.pollMessages(queueUrl, handler, options);
        } catch (error) {
          this.logger.error(
            `Error polling messages from ${destination}: ${error.message}`,
          );
        }
      }, pollingInterval);

      // บันทึกรายละเอียด consumer
      this.activeConsumers.set(consumerId, {
        queueUrl,
        running: true,
        pollingInterval: interval,
      });

      this.logger.log(
        `Started consumer ${consumerId} for queue ${destination}`,
      );

      return consumerId;
    } catch (error) {
      this.logger.error(
        `Failed to start consumer for ${destination}: ${error.message}`,
      );
      throw error;
    }
  }

  async stopConsumer(consumerId: string): Promise<void> {
    const consumer = this.activeConsumers.get(consumerId);

    if (!consumer) {
      this.logger.warn(`Consumer ${consumerId} not found`);
      return;
    }

    try {
      // หยุดการ polling
      if (consumer.pollingInterval) {
        clearInterval(consumer.pollingInterval);
      }

      consumer.running = false;
      this.activeConsumers.delete(consumerId);

      this.logger.log(`Stopped consumer ${consumerId}`);
    } catch (error) {
      this.logger.error(
        `Failed to stop consumer ${consumerId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async pollMessages<T>(
    queueUrl: string,
    handler: MessageHandler<T>,
    options?: ConsumerOptions,
  ): Promise<void> {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages:
        options?.prefetchCount || this.config.prefetchCount || 10,
      VisibilityTimeout: this.config.visibilityTimeout || 30,
      WaitTimeSeconds: this.config.waitTimeSeconds || 20, // Long polling สูงสุด 20 วินาที
      MessageAttributeNames: ['All'],
      AttributeNames: ['All'],
    });

    try {
      const response = await this.client.send(command);

      if (!response.Messages || response.Messages.length === 0) {
        return;
      }

      // ประมวลผลแต่ละ message
      await Promise.all(
        response.Messages.map((message) =>
          this.processMessage(queueUrl, message, handler, options),
        ),
      );
    } catch (error) {
      this.logger.error(`Error receiving messages: ${error.message}`);
    }
  }

  private async processMessage<T>(
    queueUrl: string,
    message: Message,
    handler: MessageHandler<T>,
    options?: ConsumerOptions,
  ): Promise<void> {
    if (!message.Body || !message.ReceiptHandle) {
      this.logger.warn('Received message with no body or receipt handle');
      return;
    }

    try {
      // แปลง message body
      const content = JSON.parse(message.Body) as T;

      // แปลง message attributes เป็น headers
      const headers = this.convertMessageAttributesToHeaders(
        message.MessageAttributes,
      );

      // รับหรือตั้งค่า retry count เป็น 0
      const receivedCount = parseInt(headers['x-retry-count'] || '0', 10);

      // สร้าง metadata
      const metadata: MessageMetadata = {
        id: message.MessageId || uuidv4(),
        timestamp: message.Attributes?.SentTimestamp
          ? new Date(parseInt(message.Attributes.SentTimestamp, 10))
          : new Date(),
        headers,
        destination: queueUrl,
        redelivered: receivedCount > 0,
        receivedCount,
        // เพิ่ม SQS-specific fields
        receiptHandle: message.ReceiptHandle,
      };

      // เรียก handler function
      await handler(content, metadata);

      // ถ้า autoAck เปิดใช้งาน (default) หรือไม่ได้ระบุ ให้ลบ message
      if (options?.autoAck !== false) {
        await this.deleteMessage(queueUrl, message.ReceiptHandle);
      }
    } catch (error) {
      // จัดการกับข้อผิดพลาด
      await this.handleConsumerError(queueUrl, message, error, options);
    }
  }

  private async handleConsumerError(
    queueUrl: string,
    message: Message,
    error: Error,
    options?: ConsumerOptions,
  ): Promise<void> {
    if (!message.ReceiptHandle) return;

    this.logger.error(`Error processing message: ${error.message}`);

    // ดึง retry count ปัจจุบัน
    const headers = this.convertMessageAttributesToHeaders(
      message.MessageAttributes,
    );
    const retryCount = parseInt(headers['x-retry-count'] || '0', 10);
    const maxRetries = options?.retryCount || 3;

    if (retryCount < maxRetries) {
      // ลองใหม่
      const newRetryCount = retryCount + 1;
      this.logger.log(
        `Retrying message, attempt ${newRetryCount}/${maxRetries}`,
      );

      if (options?.retryDelay) {
        // เปลี่ยน visibility timeout เพื่อทำการ delay
        await this.changeMessageVisibility(
          queueUrl,
          message.ReceiptHandle,
          options.retryDelay,
        );
      } else {
        // ส่งกลับไปยัง queue ทันที
        await this.changeMessageVisibility(queueUrl, message.ReceiptHandle, 0);
      }
    } else {
      // เกินจำนวน retry สูงสุด จะถูกส่งไปยัง DLQ อัตโนมัติ (ถ้ากำหนดไว้)
      this.logger.warn(
        `Message exceeded max retries (${maxRetries}), sending to DLQ`,
      );
      await this.deleteMessage(queueUrl, message.ReceiptHandle);
    }
  }

  private async deleteMessage(
    queueUrl: string,
    receiptHandle: string,
  ): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
    }
  }

  private async changeMessageVisibility(
    queueUrl: string,
    receiptHandle: string,
    visibilityTimeoutSeconds: number,
  ): Promise<void> {
    try {
      const command = new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: visibilityTimeoutSeconds,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error(`Error changing message visibility: ${error.message}`);
    }
  }

  private async getQueueUrl(queueName: string): Promise<string> {
    // ตรวจสอบว่ามี URL ใน cache หรือไม่
    if (this.queueUrls.has(queueName)) {
      return this.queueUrls.get(queueName);
    }

    // เพิ่ม .fifo สำหรับ FIFO queues
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

      // ตั้งค่า attributes สำหรับ FIFO queues
      if (this.config.isFifo) {
        attributes.FifoQueue = 'true';
        attributes.ContentBasedDeduplication = 'false';
      }

      // ตั้งค่า visibility timeout ถ้ามีการระบุ
      if (this.config.visibilityTimeout) {
        attributes.VisibilityTimeout = String(this.config.visibilityTimeout);
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

  private async setupDeadLetterQueue(
    sourceQueueUrl: string,
    deadLetterQueueName: string,
    maxReceiveCount: number,
  ): Promise<void> {
    try {
      // สร้างหรือดึง dead letter queue
      const dlqUrl = await this.getQueueUrl(deadLetterQueueName);

      // ดึง queue ARN จาก URL
      const dlqArn = this.getQueueArnFromUrl(dlqUrl);

      // ตั้งค่า redrive policy บน source queue
      const command = new SetQueueAttributesCommand({
        QueueUrl: sourceQueueUrl,
        Attributes: {
          RedrivePolicy: JSON.stringify({
            deadLetterTargetArn: dlqArn,
            maxReceiveCount: maxReceiveCount.toString(),
          }),
        },
      });

      await this.client.send(command);

      this.logger.log(
        `Set up dead letter queue for ${sourceQueueUrl} pointing to ${deadLetterQueueName}`,
      );
    } catch (error) {
      this.logger.error(`Error setting up dead letter queue: ${error.message}`);
      throw error;
    }
  }

  private getQueueArnFromUrl(queueUrl: string): string {
    // URL format: https://sqs.{region}.amazonaws.com/{account-id}/{queue-name}
    const parts = queueUrl.split('/');
    const region = parts[2].split('.')[1];
    const accountId = parts[3];
    const queueName = parts[4];

    return `arn:aws:sqs:${region}:${accountId}:${queueName}`;
  }

  private convertMessageAttributesToHeaders(
    attributes?: Record<string, any>,
  ): Record<string, string> {
    if (!attributes) return {};

    const headers: Record<string, string> = {};

    Object.entries(attributes).forEach(([key, attribute]) => {
      if (attribute.StringValue) {
        headers[key] = attribute.StringValue;
      }
    });

    return headers;
  }
}
