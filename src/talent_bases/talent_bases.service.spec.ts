import { Test, TestingModule } from '@nestjs/testing';
import { TalentBasesService } from './talent_bases.service';

describe('TalentBasesService', () => {
  let service: TalentBasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TalentBasesService],
    }).compile();

    service = module.get<TalentBasesService>(TalentBasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
