import { Module } from '@nestjs/common';
import { AvatarBaseService } from './avatar_base.service';
import { AvatarBaseResolver } from './avatar_base.resolver';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [CacheModule],
  providers: [AvatarBaseResolver, AvatarBaseService],
})
export class AvatarBaseModule {}
