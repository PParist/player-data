import { Module } from '@nestjs/common';
import { TalentBasesService } from './talent_bases.service';
import { TalentBasesResolver } from './talent_bases.resolver';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [CacheModule],
  providers: [TalentBasesResolver, TalentBasesService],
})
export class TalentBasesModule {}
