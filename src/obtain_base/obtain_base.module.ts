import { Module } from '@nestjs/common';
import { ObtainBaseService } from './obtain_base.service';
import { ObtainBaseResolver } from './obtain_base.resolver';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [CacheModule],
  providers: [ObtainBaseResolver, ObtainBaseService],
})
export class ObtainBaseModule {}
