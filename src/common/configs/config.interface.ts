export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  graphql: GraphqlConfig;
  security: SecurityConfig;
  redis: RedisConfig;
  messaging: MessagingConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  schemaDestination: string;
  sortSchema: boolean;
  enumsConfig?: {
    enableLoginType?: boolean;
  };
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  db?: number;
  tls?: boolean;
  retryStrategy?: (times: number) => number | void;
}

export interface MessagingConfig {
  broker: {
    type: 'rabbitmq' | 'kafka' | 'sqs';
    url?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
  options: {
    prefetchCount: number;
    reconnectAttempts: number;
    reconnectInterval: number;
    deadLetterEnabled: boolean;
    queuePrefix?: string;
  };
  queues: {
    [key: string]: {
      retryCount: number;
      retryDelay: number;
      deadLetterEnabled: boolean;
    };
  };
}
