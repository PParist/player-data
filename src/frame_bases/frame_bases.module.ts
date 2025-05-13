import { Module } from '@nestjs/common';
import { FrameBasesService } from './frame_bases.service';
import { FrameBasesResolver } from './frame_bases.resolver';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [CacheModule],
  providers: [FrameBasesResolver, FrameBasesService],
})
export class FrameBasesModule {}
