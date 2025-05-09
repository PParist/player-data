import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageQueueService } from './message_queue.service';
import { RabbitMQProducerAdapter } from './adapters/rabbitmq-producer.adapter';
import {
  RabbitMQConsumerAdapter,
  RabbitMQConfig,
} from './adapters/rabbitmq-consumer.adapter';
import { SQSProducerAdapter } from './adapters/sqs-producer.adapter';
import { SQSConsumerAdapter, SQSConfig } from './adapters/sqs-consumer.adapter';
import { MessagingConfig } from '../common/configs/config.interface';

@Module({})
export class MessageQueueModule {
  static registerAsync(): DynamicModule {
    return {
      module: MessageQueueModule,
      imports: [ConfigModule],
      providers: [
        // Producer adapter provider
        {
          provide: 'MessageProducerPort',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            // ดึง messaging config จาก ConfigService
            const messagingConfig =
              configService.get<MessagingConfig>('config.messaging');

            // ถ้าไม่พบ config ให้ใช้ค่าเริ่มต้น
            if (!messagingConfig) {
              throw new Error('Missing messaging configuration');
            }

            const brokerType = messagingConfig.broker.type;

            switch (brokerType) {
              case 'rabbitmq': {
                // แปลง messaging config เป็น RabbitMQConfig
                const rabbitConfig: RabbitMQConfig = {
                  url: messagingConfig.broker.url,
                  reconnectAttempts: messagingConfig.options.reconnectAttempts,
                  reconnectInterval: messagingConfig.options.reconnectInterval,
                  queuePrefix: messagingConfig.options.queuePrefix,
                  exchangeType: 'topic', // default value
                };

                const rabbitProducer = new RabbitMQProducerAdapter(
                  rabbitConfig,
                );
                rabbitProducer.init();
                return rabbitProducer;
              }

              case 'sqs': {
                // แปลง messaging config เป็น SQSConfig
                const sqsConfig: SQSConfig = {
                  region: messagingConfig.broker.region || 'us-east-1',
                  accessKeyId: messagingConfig.broker.accessKeyId,
                  secretAccessKey: messagingConfig.broker.secretAccessKey,
                  reconnectAttempts: messagingConfig.options.reconnectAttempts,
                  reconnectInterval: messagingConfig.options.reconnectInterval,
                  queueUrlPrefix: messagingConfig.options.queuePrefix,
                  isFifo: configService.get<boolean>('SQS_FIFO_ENABLED', false), // SQS-specific
                };

                const sqsProducer = new SQSProducerAdapter(sqsConfig);
                sqsProducer.init();
                return sqsProducer;
              }

              default:
                throw new Error(`Unsupported broker type: ${brokerType}`);
            }
          },
        },

        // Consumer adapter provider
        {
          provide: 'MessageConsumerPort',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const messagingConfig =
              configService.get<MessagingConfig>('config.messaging');

            if (!messagingConfig) {
              throw new Error('Missing messaging configuration');
            }

            const brokerType = messagingConfig.broker.type;

            switch (brokerType) {
              case 'rabbitmq': {
                const rabbitConfig: RabbitMQConfig = {
                  url: messagingConfig.broker.url,
                  prefetchCount: messagingConfig.options.prefetchCount,
                  reconnectAttempts: messagingConfig.options.reconnectAttempts,
                  reconnectInterval: messagingConfig.options.reconnectInterval,
                  exchangeType: 'topic',
                };

                const rabbitConsumer = new RabbitMQConsumerAdapter(
                  rabbitConfig,
                );
                rabbitConsumer.init();
                return rabbitConsumer;
              }

              case 'sqs': {
                const sqsConfig: SQSConfig = {
                  region: messagingConfig.broker.region || 'us-east-1',
                  accessKeyId: messagingConfig.broker.accessKeyId,
                  secretAccessKey: messagingConfig.broker.secretAccessKey,
                  prefetchCount: messagingConfig.options.prefetchCount,
                  reconnectAttempts: messagingConfig.options.reconnectAttempts,
                  reconnectInterval: messagingConfig.options.reconnectInterval,
                  visibilityTimeout: configService.get<number>(
                    'SQS_VISIBILITY_TIMEOUT',
                    30,
                  ),
                  waitTimeSeconds: configService.get<number>(
                    'SQS_WAIT_TIME_SECONDS',
                    20,
                  ),
                  isFifo: configService.get<boolean>('SQS_FIFO_ENABLED', false),
                };

                const sqsConsumer = new SQSConsumerAdapter(sqsConfig);
                sqsConsumer.init();
                return sqsConsumer;
              }

              default:
                throw new Error(`Unsupported broker type: ${brokerType}`);
            }
          },
        },

        // Main service
        MessageQueueService,
      ],
      exports: [MessageQueueService],
    };
  }

  // สำหรับการทดสอบหรือการกำหนดค่าเอง
  static register(options: {
    type: 'rabbitmq' | 'kafka' | 'sqs';
    producerConfig: any;
    consumerConfig: any;
  }): DynamicModule {
    return {
      module: MessageQueueModule,
      providers: [
        // Producer provider
        {
          provide: 'MessageProducerPort',
          useFactory: () => {
            switch (options.type) {
              case 'rabbitmq':
                const rabbitProducer = new RabbitMQProducerAdapter(
                  options.producerConfig,
                );
                rabbitProducer.init();
                return rabbitProducer;

              case 'sqs':
                const sqsProducer = new SQSProducerAdapter(
                  options.producerConfig,
                );
                sqsProducer.init();
                return sqsProducer;

              default:
                throw new Error(`Unsupported broker type: ${options.type}`);
            }
          },
        },

        // Consumer provider
        {
          provide: 'MessageConsumerPort',
          useFactory: () => {
            switch (options.type) {
              case 'rabbitmq':
                const rabbitConsumer = new RabbitMQConsumerAdapter(
                  options.consumerConfig,
                );
                rabbitConsumer.init();
                return rabbitConsumer;

              case 'sqs':
                const sqsConsumer = new SQSConsumerAdapter(
                  options.consumerConfig,
                );
                sqsConsumer.init();
                return sqsConsumer;

              default:
                throw new Error(`Unsupported broker type: ${options.type}`);
            }
          },
        },

        // Main service
        MessageQueueService,
      ],
      exports: [MessageQueueService],
    };
  }

  // ตามแบบเดิมของคุณ - register สำหรับแต่ละ broker type
  static registerRabbitMQ(config: any): DynamicModule {
    const { producerConfig = {}, consumerConfig = {} } = config;

    return {
      module: MessageQueueModule,
      providers: [
        {
          provide: 'MessageProducerPort',
          useFactory: () => {
            const adapter = new RabbitMQProducerAdapter(producerConfig);
            adapter.init();
            return adapter;
          },
        },
        {
          provide: 'MessageConsumerPort',
          useFactory: () => {
            const adapter = new RabbitMQConsumerAdapter(consumerConfig);
            adapter.init();
            return adapter;
          },
        },
        MessageQueueService,
      ],
      exports: [MessageQueueService],
    };
  }

  static registerSQS(config: any): DynamicModule {
    const { producerConfig = {}, consumerConfig = {} } = config;

    return {
      module: MessageQueueModule,
      providers: [
        {
          provide: 'MessageProducerPort',
          useFactory: () => {
            const adapter = new SQSProducerAdapter(producerConfig);
            adapter.init();
            return adapter;
          },
        },
        {
          provide: 'MessageConsumerPort',
          useFactory: () => {
            const adapter = new SQSConsumerAdapter(consumerConfig);
            adapter.init();
            return adapter;
          },
        },
        MessageQueueService,
      ],
      exports: [MessageQueueService],
    };
  }
}
