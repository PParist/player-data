import { Test, TestingModule } from '@nestjs/testing';
import { PlayerProfilesService } from './player_profiles.service';

describe('PlayerProfilesService', () => {
  let service: PlayerProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerProfilesService],
    }).compile();

    service = module.get<PlayerProfilesService>(PlayerProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
