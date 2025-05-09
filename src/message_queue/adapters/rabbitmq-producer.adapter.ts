// src/messaging/adapters/rabbitmq-producer.adapter.ts
import { Injectable } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';
import {
  MessageProducerPort,
  MessageOptions,
  BatchMessage,
  BatchMessageResponse,
} from '../ports/message-producer.port';

export interface RabbitMQConfig {
  url: string;
  prefetchCount?: number;
  exchangeType?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  queuePrefix?: string;
}

@Injectable()
export class RabbitMQProducerAdapter implements MessageProducerPort {
  private connection: Connection;
  private channel: Channel;
  private readonly exchangeType = 'topic';

  constructor(private readonly config: RabbitMQConfig) {}

  async init() {
    this.connection = await connect(this.config.url);
    this.channel = await this.connection.createChannel();
  }

  async sendMessage<T>(
    destination: string,
    message: T,
    options?: MessageOptions,
  ) {
    await this.ensureExchange(destination);

    const content = Buffer.from(JSON.stringify(message));
    const routingKey = options?.groupId || '';
    const messageId = options?.deduplicationId || undefined;

    const publishOptions = {
      persistent: options?.persistent ?? true,
      priority: options?.priority,
      messageId,
      headers: options?.headers,
      timestamp: Date.now(),
    };

    if (options?.delay) {
      // ใช้ dead letter exchange + TTL สำหรับ delay
      await this.setupDelayedMessage(
        destination,
        content,
        routingKey,
        options.delay,
        publishOptions,
      );
    } else {
      this.channel.publish(destination, routingKey, content, publishOptions);
    }

    return { id: messageId || '' + Date.now(), timestamp: new Date() };
  }

  async sendBatch<T>(
    destination: string,
    messages: BatchMessage<T>[], // แก้จาก any[] เป็น BatchMessage<T>[]
  ): Promise<BatchMessageResponse[]> {
    // RabbitMQ ไม่มี batch API โดยตรง ให้วนลูปส่งทีละ message
    const results: BatchMessageResponse[] = [];

    for (const message of messages) {
      try {
        const result = await this.sendMessage<T>(
          destination,
          message.payload,
          message.options,
        );
        results.push({
          id: message.id,
          success: true,
          messageId: result.id,
        });
      } catch (error) {
        results.push({
          id: message.id,
          success: false,
          error,
        });
      }
    }

    return results;
  }

  private async ensureExchange(exchange: string) {
    await this.channel.assertExchange(exchange, this.exchangeType, {
      durable: true,
    });
  }

  private async setupDelayedMessage(
    exchange: string,
    content: Buffer,
    routingKey: string,
    delay: number,
    options: any,
  ) {
    // สร้าง delay queue ด้วย TTL + dead letter exchange
    const delayMs = delay * 1000;
    const delayQueueName = `delay.${delayMs}.${exchange}`;

    await this.channel.assertQueue(delayQueueName, {
      durable: true,
      deadLetterExchange: exchange,
      deadLetterRoutingKey: routingKey,
      messageTtl: delayMs,
    });

    this.channel.sendToQueue(delayQueueName, content, options);
  }
}
