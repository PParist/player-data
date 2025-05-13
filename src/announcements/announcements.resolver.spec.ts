import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsResolver } from './announcements.resolver';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsResolver', () => {
  let resolver: AnnouncementsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementsResolver, AnnouncementsService],
    }).compile();

    resolver = module.get<AnnouncementsResolver>(AnnouncementsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
