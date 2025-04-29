import { GraphQLModule } from '@nestjs/graphql';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GqlConfigService } from './gql-config.service';
import { DateScalar } from './common/scalars/date.scalar';

import { registerGraphQLEnums } from './common/graphql/enums';
import { ObtainBaseModule } from './obtain_base/obtain_base.module';
import { CostomeBaseModule } from './costome_base/costome_base.module';
import { PlayerProfilesModule } from './player_profiles/player_profiles.module';
import { CacheService } from './cache/cache.service';
import { CacheModule } from './cache/cache.module';
import config from './common/configs/config';

registerGraphQLEnums(config().graphql);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [
          // configure your prisma middleware
          loggingMiddleware({
            logger: new Logger('PrismaMiddleware'),
            logLevel: 'log',
          }),
        ],
      },
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),

    AuthModule,
    PostsModule,
    ObtainBaseModule,
    CostomeBaseModule,
    PlayerProfilesModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver, DateScalar],
})
export class AppModule {}
