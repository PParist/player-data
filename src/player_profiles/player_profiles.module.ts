import { Module } from '@nestjs/common';
import { PlayerProfilesService } from './player_profiles.service';
import { PlayerProfilesResolver } from './player_profiles.resolver';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CacheModule,
  ],
  providers: [PlayerProfilesResolver, PlayerProfilesService],
})
export class PlayerProfilesModule {}
