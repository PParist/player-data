import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
  ChangeMessageVisibilityCommand,
  GetQueueUrlCommand,
} from '@aws-sdk/client-sqs';
import {
  MessageQueuePort,
  SendMessageOptions,
  BatchMessage,
  BatchSendResult,
  ReceiveMessageOptions,
  QueueMessage,
  BatchDeleteResult,
  MessageAttributeValue,
} from '../port/message-queue.port';

@Injectable()
export class SqsAdapter implements MessageQueuePort {
  private readonly logger = new Logger(SqsAdapter.name);
  private readonly sqsClient: SQSClient;
  private queueUrlCache: Map<string, string> = new Map();

  constructor(sqsClient: SQSClient) {
    this.sqsClient = sqsClient;
  }

  /**
   * แปลงจาก body object เป็น string สำหรับส่งไปยัง SQS
   */
  private serializeMessage(body: any): string {
    return typeof body === 'string' ? body : JSON.stringify(body);
  }

  /**
   * แปลงจาก string กลับเป็น object
   */
  private deserializeMessage(body: string): any {
    try {
      return JSON.parse(body);
    } catch {
      // ถ้า parse ไม่ได้ คืนค่าเป็น string เดิม
      return body;
    }
  }

  /**
   * ดึง Queue URL จากชื่อ queue พร้อมทำ caching
   */
  private async getQueueUrl(queueName: string): Promise<string> {
    if (this.queueUrlCache.has(queueName)) {
      return this.queueUrlCache.get(queueName)!;
    }

    try {
      const command = new GetQueueUrlCommand({ QueueName: queueName });
      const response = await this.sqsClient.send(command);

      if (!response.QueueUrl) {
        throw new Error(`Queue URL not found for queue: ${queueName}`);
      }

      this.queueUrlCache.set(queueName, response.QueueUrl);
      return response.QueueUrl;
    } catch (error) {
      this.logger.error(
        `Failed to get queue URL for ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendMessage(
    queueName: string,
    message: any,
    options?: SendMessageOptions,
  ): Promise<string> {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: this.serializeMessage(message),
        DelaySeconds: options?.delaySeconds,
        MessageAttributes: options?.messageAttributes
          ? this.convertMessageAttributes(options.messageAttributes)
          : undefined,
        MessageGroupId: options?.messageGroupId,
        MessageDeduplicationId: options?.messageDeduplicationId,
      });

      const response = await this.sqsClient.send(command);

      if (!response.MessageId) {
        throw new Error('No MessageId returned from SQS');
      }

      this.logger.debug(`Sent message to ${queueName}: ${response.MessageId}`);
      return response.MessageId;
    } catch (error) {
      this.logger.error(
        `Failed to send message to ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendBatch(
    queueName: string,
    messages: BatchMessage[],
  ): Promise<BatchSendResult[]> {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      // SQS จำกัดให้ส่งได้ไม่เกิน 10 messages ต่อครั้ง
      const batches = this.chunkArray(messages, 10);
      const results: BatchSendResult[] = [];

      for (const batch of batches) {
        const entries = batch.map((msg) => ({
          Id: msg.id,
          MessageBody: this.serializeMessage(msg.body),
          DelaySeconds: msg.delaySeconds,
          MessageAttributes: msg.messageAttributes
            ? this.convertMessageAttributes(msg.messageAttributes)
            : undefined,
          MessageGroupId: msg.messageGroupId,
          MessageDeduplicationId: msg.messageDeduplicationId,
        }));

        const command = new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        });

        const response = await this.sqsClient.send(command);

        // แปลงผลลัพธ์
        if (response.Successful) {
          results.push(
            ...response.Successful.map((result) => ({
              id: result.Id!,
              messageId: result.MessageId,
            })),
          );
        }

        if (response.Failed) {
          results.push(
            ...response.Failed.map((result) => ({
              id: result.Id!,
              error: new Error(result.Message || 'Unknown error'),
            })),
          );
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to send batch to ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  async receiveMessages(
    queueName: string,
    options?: ReceiveMessageOptions,
  ): Promise<QueueMessage[]> {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: options?.maxNumberOfMessages || 1,
        VisibilityTimeout: options?.visibilityTimeout,
        WaitTimeSeconds: options?.waitTimeSeconds,
        AttributeNames: options?.attributeNames as any,
        MessageAttributeNames: options?.messageAttributeNames || ['All'],
      });

      const response = await this.sqsClient.send(command);

      if (!response.Messages || response.Messages.length === 0) {
        return [];
      }

      return response.Messages.map((msg) => ({
        messageId: msg.MessageId!,
        receiptHandle: msg.ReceiptHandle!,
        body: this.deserializeMessage(msg.Body!),
        attributes: msg.Attributes,
        messageAttributes: msg.MessageAttributes
          ? this.convertFromSqsMessageAttributes(msg.MessageAttributes)
          : undefined,
        md5OfBody: msg.MD5OfBody,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to receive messages from ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteMessage(queueName: string, receiptHandle: string): Promise<void> {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
      this.logger.debug(`Deleted message from ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete message from ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteBatch(
    queueName: string,
    receiptHandles: string[],
  ): Promise<BatchDeleteResult[]> {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      // SQS จำกัดให้ลบได้ไม่เกิน 10 messages ต่อครั้ง
      const batches = this.chunkArray(receiptHandles, 10);
      const results: BatchDeleteResult[] = [];

      for (const batch of batches) {
        const entries = batch.map((handle, index) => ({
          Id: `msg-${index}`,
          ReceiptHandle: handle,
        }));

        const command = new DeleteMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        });

        const response = await this.sqsClient.send(command);

        // แปลงผลลัพธ์
        if (response.Successful) {
          results.push(
            ...response.Successful.map((result) => ({
              id: result.Id!,
              success: true,
            })),
          );
        }

        if (response.Failed) {
          results.push(
            ...response.Failed.map((result) => ({
              id: result.Id!,
              success: false,
              error: new Error(result.Message || 'Unknown error'),
            })),
          );
        }
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to delete batch from ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  async changeMessageVisibility(
    queueName: string,
    receiptHandle: string,
    visibilityTimeout: number,
  ): Promise<void> {
    try {
      const queueUrl = await this.getQueueUrl(queueName);

      const command = new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
        VisibilityTimeout: visibilityTimeout,
      });

      await this.sqsClient.send(command);
      this.logger.debug(
        `Changed visibility timeout for message in ${queueName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to change message visibility in ${queueName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Helper method: แบ่ง array เป็น chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Helper method: แปลง message attributes เป็นรูปแบบของ SQS
   */
  private convertMessageAttributes(
    attributes: Record<string, MessageAttributeValue>,
  ): Record<
    string,
    { DataType: string; StringValue?: string; BinaryValue?: Buffer }
  > {
    const sqsAttributes: Record<string, any> = {};

    for (const [key, value] of Object.entries(attributes)) {
      sqsAttributes[key] = {
        DataType: value.dataType,
        StringValue: value.stringValue,
        BinaryValue: value.binaryValue,
      };
    }

    return sqsAttributes;
  }

  /**
   * Helper method: แปลง SQS message attributes กลับเป็นรูปแบบของเรา
   */
  private convertFromSqsMessageAttributes(
    sqsAttributes: Record<string, any>,
  ): Record<string, MessageAttributeValue> {
    const attributes: Record<string, MessageAttributeValue> = {};

    for (const [key, value] of Object.entries(sqsAttributes)) {
      attributes[key] = {
        dataType: value.DataType as any,
        stringValue: value.StringValue,
        binaryValue: value.BinaryValue,
      };
    }

    return attributes;
  }
}
