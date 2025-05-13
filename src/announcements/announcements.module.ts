import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsResolver } from './announcements.resolver';

@Module({
  providers: [AnnouncementsResolver, AnnouncementsService],
})
export class AnnouncementsModule {}
