import { Module } from '@nestjs/common';
import { CostomeBaseService } from './costome_base.service';
import { CostomeBaseResolver } from './costome_base.resolver';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [CacheModule],
  providers: [CostomeBaseResolver, CostomeBaseService],
})
export class CostomeBaseModule {}
