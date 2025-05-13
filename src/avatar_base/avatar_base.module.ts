import { Module } from '@nestjs/common';
import { AvatarBaseService } from './avatar_base.service';
import { AvatarBaseResolver } from './avatar_base.resolver';

@Module({
  providers: [AvatarBaseResolver, AvatarBaseService],
})
export class AvatarBaseModule {}
