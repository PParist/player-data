import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Nestjs FTW',
    description: 'The nestjs API description',
    version: '1.5',
    path: 'api',
  },
  graphql: {
    playgroundEnabled: true,
    debug: true,
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
    enumsConfig: {
      enableLoginType: true,
    },
  },
  security: {
    expiresIn: '1h',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: undefined,
    username: undefined,
    db: 0,
    tls: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  },
};

export default (): Config => config;
