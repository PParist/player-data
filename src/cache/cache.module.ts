// src/cache/cache.module.ts
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module, DynamicModule } from '@nestjs/common';
import { InMemoryCacheAdapter } from './adapter/in-memory-cache.adapter';
import { RedisCacheAdapter } from './adapter/redis-cache.adapter';
import { LocalCacheService } from './local-cache.service';
import { DistributedCacheService } from './distributed-cache.service';
import { RedisModule } from './redish.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    NestCacheModule.register({
      ttl: 60 * 1000,
      max: 100,
    }),
    RedisModule.registerAsync(), // ลงทะเบียน Redis ทุกครั้ง
  ],
  providers: [
    // Local cache providers
    InMemoryCacheAdapter,
    {
      provide: 'LOCAL_CACHE_PORT',
      useExisting: InMemoryCacheAdapter,
    },
    {
      provide: LocalCacheService,
      inject: ['LOCAL_CACHE_PORT'],
      useFactory: (localCachePort) => new LocalCacheService(localCachePort),
    },
    
    // Distributed cache providers - จัดให้สร้างทุกครั้งไม่ต้องมีเงื่อนไข
    {
      provide: 'REDIS_ADAPTER',
      inject: ['REDIS_CLIENT'],
      useFactory: (redisClient) => new RedisCacheAdapter(redisClient),
    },
    {
      provide: 'DISTRIBUTED_CACHE_PORT',
      useExisting: 'REDIS_ADAPTER',
    },
    {
      provide: DistributedCacheService,
      inject: ['DISTRIBUTED_CACHE_PORT'],
      useFactory: (distributedCachePort) => new DistributedCacheService(distributedCachePort),
    }
  ],
  exports: [LocalCacheService, DistributedCacheService], // ส่งออก services ทั้งสองประเภทเสมอ
})
export class CacheModule {}