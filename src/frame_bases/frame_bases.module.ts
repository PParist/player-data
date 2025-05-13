import { Module } from '@nestjs/common';
import { FrameBasesService } from './frame_bases.service';
import { FrameBasesResolver } from './frame_bases.resolver';

@Module({
  providers: [FrameBasesResolver, FrameBasesService],
})
export class FrameBasesModule {}
