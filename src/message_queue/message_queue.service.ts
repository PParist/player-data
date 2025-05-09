import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageProducerPort } from './ports/message-producer.port';
import { MessageConsumerPort } from './ports/message-consumer.port';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageQueueService {
  private readonly logger = new Logger(MessageQueueService.name);
  private consumers: Map<string, string> = new Map();

  constructor(
    @Inject('MessageProducerPort')
    private readonly producer: MessageProducerPort,
    @Inject('MessageConsumerPort')
    private readonly consumer: MessageConsumerPort,
    private readonly configService: ConfigService,
  ) {}

  /**
   * ส่ง message ไปยัง queue
   */
  async sendMessage<T>(
    destination: string,
    messageType: string,
    data: T,
    options: {
      idempotencyKey?: string;
      correlationId?: string;
      groupId?: string;
      delay?: number;
      metadata?: Record<string, any>;
    } = {},
  ) {
    const idempotencyKey = options.idempotencyKey || uuidv4();
    const correlationId = options.correlationId || uuidv4();

    const message = {
      id: uuidv4(),
      type: messageType,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        correlationId,
        idempotencyKey,
        source: this.configService.get<string>('SERVICE_NAME', 'unknown'),
        ...options.metadata,
      },
    };

    try {
      return await this.producer.sendMessage(
        this.getQueueName(destination),
        message,
        {
          groupId: options.groupId,
          deduplicationId: idempotencyKey,
          delay: options.delay,
          headers: {
            'x-message-type': messageType,
            'x-correlation-id': correlationId,
            'x-idempotency-key': idempotencyKey,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Error sending message to ${destination}: ${error.message}`,
      );
      throw error;
    }
  }

  async startConsumer<T>(
    name: string,
    queueName: string,
    handler: (message: T, metadata: any) => Promise<any>,
    options: {
      concurrency?: number;
      prefetchCount?: number;
    } = {},
  ) {
    if (this.consumers.has(name)) {
      this.logger.warn(`Consumer ${name} is already running`);
      return;
    }

    const fullQueueName = this.getQueueName(queueName);
    const queueOptions = this.getQueueConfig(queueName);

    try {
      const consumerId = await this.consumer.startConsumer(
        fullQueueName,
        async (message, metadata) => {
          try {
            return await handler(message, metadata);
          } catch (error) {
            this.logger.error(
              `Error processing message ${metadata.id} in consumer ${name}: ${error.message}`,
              error.stack,
            );
            throw error;
          }
        },
        {
          prefetchCount: options.prefetchCount || queueOptions.prefetchCount,
          concurrency: options.concurrency || queueOptions.concurrency,
          retryCount: queueOptions.retryCount,
          retryDelay: queueOptions.retryDelay,
          deadLetterQueue: queueOptions.deadLetterEnabled
            ? `${fullQueueName}.dlq`
            : undefined,
        },
      );

      this.consumers.set(name, consumerId);
      this.logger.log(`Started consumer ${name} for queue ${fullQueueName}`);

      return consumerId;
    } catch (error) {
      this.logger.error(`Error starting consumer ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * หยุด consumer
   */
  async stopConsumer(name: string): Promise<void> {
    const consumerId = this.consumers.get(name);

    if (!consumerId) {
      this.logger.warn(`Consumer ${name} not found`);
      return;
    }

    try {
      await this.consumer.stopConsumer(consumerId);
      this.consumers.delete(name);
      this.logger.log(`Stopped consumer ${name}`);
    } catch (error) {
      this.logger.error(`Error stopping consumer ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * ส่ง batch messages
   */
  async sendBatch<T>(
    destination: string,
    messages: {
      type: string;
      data: T;
      options?: {
        idempotencyKey?: string;
        correlationId?: string;
        groupId?: string;
      };
    }[],
  ) {
    const batch = messages.map((msg) => {
      const id = uuidv4();
      const idempotencyKey = msg.options?.idempotencyKey || id;
      const correlationId = msg.options?.correlationId || uuidv4();

      return {
        id,
        payload: {
          id,
          type: msg.type,
          timestamp: new Date().toISOString(),
          data: msg.data,
          metadata: {
            correlationId,
            idempotencyKey,
            source: this.configService.get<string>('SERVICE_NAME', 'unknown'),
          },
        },
        options: {
          groupId: msg.options?.groupId,
          deduplicationId: idempotencyKey,
          headers: {
            'x-message-type': msg.type,
            'x-correlation-id': correlationId,
            'x-idempotency-key': idempotencyKey,
          },
        },
      };
    });

    try {
      return await this.producer.sendBatch(
        this.getQueueName(destination),
        batch,
      );
    } catch (error) {
      this.logger.error(
        `Error sending batch messages to ${destination}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * รับ queue name พร้อม prefix (ถ้ามี)
   */
  private getQueueName(queueName: string): string {
    const prefix = this.configService.get<string>('BROKER_QUEUE_PREFIX', '');
    return prefix ? `${prefix}.${queueName}` : queueName;
  }

  /**
   * รับ queue config จาก environment variables
   */
  private getQueueConfig(queueName: string): {
    prefetchCount: number;
    concurrency: number;
    retryCount: number;
    retryDelay: number;
    deadLetterEnabled: boolean;
  } {
    const upperQueueName = queueName.toUpperCase();

    return {
      prefetchCount: this.configService.get<number>(
        `QUEUE_${upperQueueName}_PREFETCH_COUNT`,
        10,
      ),
      concurrency: this.configService.get<number>(
        `QUEUE_${upperQueueName}_CONCURRENCY`,
        5,
      ),
      retryCount: this.configService.get<number>(
        `QUEUE_${upperQueueName}_RETRY_COUNT`,
        3,
      ),
      retryDelay: this.configService.get<number>(
        `QUEUE_${upperQueueName}_RETRY_DELAY`,
        5,
      ),
      deadLetterEnabled: this.configService.get<boolean>(
        `QUEUE_${upperQueueName}_DLQ_ENABLED`,
        true,
      ),
    };
  }
}
