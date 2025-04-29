import { Module } from '@nestjs/common';
import { CostomeBaseService } from './costome_base.service';
import { CostomeBaseResolver } from './costome_base.resolver';

@Module({
  providers: [CostomeBaseResolver, CostomeBaseService],
})
export class CostomeBaseModule {}
