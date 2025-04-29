import { Test, TestingModule } from '@nestjs/testing';
import { CostomeBaseService } from './costome_base.service';

describe('CostomeBaseService', () => {
  let service: CostomeBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostomeBaseService],
    }).compile();

    service = module.get<CostomeBaseService>(CostomeBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
