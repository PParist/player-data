import { Module } from '@nestjs/common';
import { TalentBasesService } from './talent_bases.service';
import { TalentBasesResolver } from './talent_bases.resolver';

@Module({
  providers: [TalentBasesResolver, TalentBasesService],
})
export class TalentBasesModule {}
