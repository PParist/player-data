import { Test, TestingModule } from '@nestjs/testing';
import { TalentBasesResolver } from './talent_bases.resolver';
import { TalentBasesService } from './talent_bases.service';

describe('TalentBasesResolver', () => {
  let resolver: TalentBasesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TalentBasesResolver, TalentBasesService],
    }).compile();

    resolver = module.get<TalentBasesResolver>(TalentBasesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
