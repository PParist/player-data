import { Injectable, Logger } from '@nestjs/common';
import { Connection, Channel, connect, ConsumeMessage } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import {
  MessageConsumerPort,
  MessageHandler,
  ConsumerOptions,
  MessageMetadata,
} from '../ports/message-consumer.port';

export interface RabbitMQConfig {
  url: string;
  prefetchCount?: number;
  exchangeType?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  queuePrefix?: string;
}

@Injectable()
export class RabbitMQConsumerAdapter implements MessageConsumerPort {
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQConsumerAdapter.name);
  private activeConsumers: Map<
    string,
    {
      consumerTag: string;
      queue: string;
    }
  > = new Map();

  constructor(private readonly config: RabbitMQConfig) {}

  async init(): Promise<void> {
    try {
      this.connection = await connect(this.config.url);
      this.channel = await this.connection.createChannel();

      // ตั้งค่า global prefetch count ถ้ามีการกำหนด
      if (this.config.prefetchCount) {
        await this.channel.prefetch(this.config.prefetchCount);
      }

      // จัดการเมื่อ connection ขาดการเชื่อมต่อ
      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
        this.reconnect();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.reconnect();
      });

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      this.reconnect();
    }
  }

  private async reconnect(attempt = 1): Promise<void> {
    const maxAttempts = this.config.reconnectAttempts || 10;
    const interval = this.config.reconnectInterval || 5000;

    if (attempt > maxAttempts) {
      this.logger.error(
        `Failed to reconnect to RabbitMQ after ${maxAttempts} attempts`,
      );
      return;
    }

    this.logger.log(
      `Attempting to reconnect to RabbitMQ (${attempt}/${maxAttempts})...`,
    );

    setTimeout(async () => {
      try {
        await this.init();
        // ถ้าเชื่อมต่อสำเร็จ ให้เริ่มต้น consumers ที่กำลังทำงานอยู่ใหม่
        await this.restartActiveConsumers();
      } catch (error) {
        this.logger.error(
          `Reconnect attempt ${attempt} failed: ${error.message}`,
        );
        this.reconnect(attempt + 1);
      }
    }, interval);
  }

  private async restartActiveConsumers(): Promise<void> {
    for (const [consumerId, { queue }] of this.activeConsumers.entries()) {
      // เราไม่สามารถเริ่มต้น consumers โดยตรงเพราะเราไม่มี handler functions
      // เราจะลบออกเพื่อให้ service ลงทะเบียนใหม่
      this.activeConsumers.delete(consumerId);
      this.logger.log(
        `Consumer for queue ${queue} needs to be manually restarted`,
      );
    }
  }

  async startConsumer<T = any>(
    destination: string,
    handler: MessageHandler<T>,
    options?: ConsumerOptions,
  ): Promise<string> {
    try {
      if (!this.channel) {
        await this.init();
      }

      const consumerId = uuidv4();
      const exchangeType = this.config.exchangeType || 'topic';
      const queueName = `queue.${destination}`;
      const deadLetterExchange = options?.deadLetterQueue
        ? `dlx.${options.deadLetterQueue}`
        : undefined;

      // 1. สร้าง exchange
      await this.channel.assertExchange(destination, exchangeType, {
        durable: true,
      });

      // 2. สร้าง dead letter exchange ถ้าต้องการ
      if (deadLetterExchange) {
        await this.channel.assertExchange(deadLetterExchange, 'fanout', {
          durable: true,
        });

        // สร้าง dead letter queue
        const dlq = `queue.${options.deadLetterQueue}`;
        await this.channel.assertQueue(dlq, { durable: true });
        await this.channel.bindQueue(dlq, deadLetterExchange, '');
      }

      // 3. สร้าง queue พร้อม options
      const queueOptions: any = {
        durable: true,
      };

      if (deadLetterExchange) {
        queueOptions.deadLetterExchange = deadLetterExchange;
      }

      const assertQueue = await this.channel.assertQueue(
        queueName,
        queueOptions,
      );

      // 4. ผูก queue กับ exchange
      await this.channel.bindQueue(assertQueue.queue, destination, '#');

      // 5. ตั้งค่า prefetch สำหรับ consumer นี้โดยเฉพาะ
      if (options?.prefetchCount) {
        await this.channel.prefetch(options.prefetchCount);
      }

      // 6. สร้าง consumer
      const { consumerTag } = await this.channel.consume(
        assertQueue.queue,
        async (msg) => {
          if (!msg) return; // null delivery เมื่อ consumer ถูกยกเลิก

          try {
            await this.processMessage(msg, handler, options);

            // ถ้าไม่ได้ระบุ autoAck หรือเป็น true ให้ ack อัตโนมัติ
            if (options?.autoAck !== false) {
              this.channel.ack(msg);
            }
          } catch (error) {
            this.handleConsumerError(msg, error, options);
          }
        },
        { noAck: false }, // เราจะจัดการ ack/nack เอง
      );

      // บันทึก consumer ที่กำลังทำงาน
      this.activeConsumers.set(consumerId, {
        consumerTag,
        queue: assertQueue.queue,
      });

      this.logger.log(
        `Started consumer ${consumerId} for destination ${destination}`,
      );

      return consumerId;
    } catch (error) {
      this.logger.error(
        `Failed to start consumer for ${destination}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async stopConsumer(consumerId: string): Promise<void> {
    const consumerInfo = this.activeConsumers.get(consumerId);

    if (!consumerInfo) {
      this.logger.warn(`Consumer ${consumerId} not found`);
      return;
    }

    try {
      await this.channel.cancel(consumerInfo.consumerTag);
      this.activeConsumers.delete(consumerId);
      this.logger.log(`Stopped consumer ${consumerId}`);
    } catch (error) {
      this.logger.error(
        `Failed to stop consumer ${consumerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async processMessage<T>(
    msg: ConsumeMessage,
    handler: MessageHandler<T>,
    options?: ConsumerOptions,
  ): Promise<void> {
    // แปลง buffer เป็น object
    let content: T;
    try {
      content = JSON.parse(msg.content.toString());
    } catch (error) {
      this.logger.error(`Failed to parse message: ${error.message}`);
      this.channel.reject(msg, false);
      return;
    }

    // สร้าง metadata สำหรับ handler
    const metadata: MessageMetadata = {
      id: msg.properties.messageId || uuidv4(),
      timestamp: new Date(msg.properties.timestamp || Date.now()),
      headers: msg.properties.headers as Record<string, string>,
      destination: msg.fields.exchange,
      redelivered: msg.fields.redelivered,
      receivedCount: this.getDeliveryCount(msg),
      consumerOptions: options,
    };

    // เรียก handler function
    await handler(content, metadata);
  }

  private handleConsumerError(
    msg: ConsumeMessage,
    error: Error,
    options?: ConsumerOptions,
  ): void {
    this.logger.error(
      `Error processing message: ${error.message}`,
      error.stack,
    );

    const retryCount = this.getDeliveryCount(msg);
    const maxRetries = options?.retryCount || 3;

    if (retryCount < maxRetries) {
      // Nack และส่งกลับไปยัง queue เพื่อ retry
      this.logger.log(
        `Retrying message, attempt ${retryCount + 1}/${maxRetries}`,
      );

      if (options?.retryDelay) {
        // ถ้ามี retryDelay ให้ใช้ delay queue
        this.sendToDelayQueue(msg, options.retryDelay);
      } else {
        // ถ้าไม่มี retryDelay ให้ส่งกลับไปยัง queue ทันที
        this.channel.nack(msg, false, true);
      }
    } else {
      // เกินจำนวน retry ที่กำหนด ส่งไปยัง dead letter queue
      this.logger.warn(
        `Message exceeded max retries (${maxRetries}), sending to DLQ`,
      );
      // เมื่อ reject (ไม่ requeue) และมีการตั้งค่า deadLetterExchange
      // message จะถูกส่งไปยัง dead letter exchange
      this.channel.reject(msg, false);
    }
  }

  private getDeliveryCount(msg: ConsumeMessage): number {
    // ตรวจสอบจาก header x-death
    const xDeath = msg.properties.headers?.['x-death'] as any[];

    if (xDeath && xDeath.length > 0) {
      return xDeath[0].count;
    }

    // ถ้าไม่มี x-death ตรวจสอบจาก header ที่เรากำหนดเอง
    const count = msg.properties.headers?.['x-retry-count'] as number;
    return count || 0;
  }

  private async sendToDelayQueue(
    msg: ConsumeMessage,
    delaySeconds: number,
  ): Promise<void> {
    try {
      const originalQueue = msg.fields.routingKey;
      const delayMs = delaySeconds * 1000;
      const delayQueueName = `delay.${delayMs}.${originalQueue}`;

      // เพิ่ม retry count
      const headers = { ...msg.properties.headers };
      headers['x-retry-count'] = (headers['x-retry-count'] || 0) + 1;

      // สร้าง delay queue
      await this.channel.assertQueue(delayQueueName, {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: originalQueue,
        messageTtl: delayMs,
        expires: delayMs * 2,
      });

      // ส่ง message ไปยัง delay queue
      this.channel.publish('', delayQueueName, msg.content, {
        ...msg.properties,
        headers,
      });

      // Ack message เดิม
      this.channel.ack(msg);
    } catch (error) {
      this.logger.error(
        `Failed to send to delay queue: ${error.message}`,
        error.stack,
      );
      // ถ้าไม่สามารถส่งไปยัง delay queue ได้ ให้ส่งกลับไปยัง queue เดิม
      this.channel.nack(msg, false, true);
    }
  }

  // ใช้เมื่อต้องการปิดการเชื่อมต่อ (ใช้ใน onModuleDestroy)
  async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }

      if (this.connection) {
        await this.connection.close();
      }

      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }
}
