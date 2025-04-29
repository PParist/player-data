import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { InMemoryCacheAdapter } from './adapter/in-memory-cache.adapter';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: 60 * 1000,
      max: 100, 
    }),
  ],
  providers: [
    CacheService,
    InMemoryCacheAdapter,
    {         
        provide: 'CACHE_PORT',
        useExisting: InMemoryCacheAdapter,
    }
  ],
  exports: [CacheService],
})
export class CacheModule {}