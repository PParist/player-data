import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsResolver } from './announcements.resolver';
import { CacheModule } from '../cache/cache.module';
@Module({
  imports: [CacheModule],
  providers: [AnnouncementsResolver, AnnouncementsService],
})
export class AnnouncementsModule {}
