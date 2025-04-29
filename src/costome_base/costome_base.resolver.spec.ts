import { Test, TestingModule } from '@nestjs/testing';
import { CostomeBaseResolver } from './costome_base.resolver';
import { CostomeBaseService } from './costome_base.service';

describe('CostomeBaseResolver', () => {
  let resolver: CostomeBaseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostomeBaseResolver, CostomeBaseService],
    }).compile();

    resolver = module.get<CostomeBaseResolver>(CostomeBaseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
