import { Test, TestingModule } from '@nestjs/testing';
import { PlayerProfilesResolver } from './player_profiles.resolver';
import { PlayerProfilesService } from './player_profiles.service';

describe('PlayerProfilesResolver', () => {
  let resolver: PlayerProfilesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerProfilesResolver, PlayerProfilesService],
    }).compile();

    resolver = module.get<PlayerProfilesResolver>(PlayerProfilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
