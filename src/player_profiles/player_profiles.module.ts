import { Module } from '@nestjs/common';
import { PlayerProfilesService } from './player_profiles.service';
import { PlayerProfilesResolver } from './player_profiles.resolver';
import { CacheModule } from '../cache/cache.module';
import { MessageQueueModule } from '../message_queue/message_queue.module';

@Module({
  imports: [CacheModule, MessageQueueModule.registerAsync()],
  providers: [PlayerProfilesResolver, PlayerProfilesService],
})
export class PlayerProfilesModule {}
