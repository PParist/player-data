import { Test, TestingModule } from '@nestjs/testing';
import { ObtainBaseResolver } from './obtain_base.resolver';
import { ObtainBaseService } from './obtain_base.service';

describe('ObtainBaseResolver', () => {
  let resolver: ObtainBaseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObtainBaseResolver, ObtainBaseService],
    }).compile();

    resolver = module.get<ObtainBaseResolver>(ObtainBaseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
