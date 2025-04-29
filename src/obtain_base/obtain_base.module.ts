import { Module } from '@nestjs/common';
import { ObtainBaseService } from './obtain_base.service';
import { ObtainBaseResolver } from './obtain_base.resolver';

@Module({
  providers: [ObtainBaseResolver, ObtainBaseService],
})
export class ObtainBaseModule {}
