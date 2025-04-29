import { Test, TestingModule } from '@nestjs/testing';
import { ObtainBaseService } from './obtain_base.service';

describe('ObtainBaseService', () => {
  let service: ObtainBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObtainBaseService],
    }).compile();

    service = module.get<ObtainBaseService>(ObtainBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
