import { Test, TestingModule } from '@nestjs/testing';
import { FrameBasesResolver } from './frame_bases.resolver';
import { FrameBasesService } from './frame_bases.service';

describe('FrameBasesResolver', () => {
  let resolver: FrameBasesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrameBasesResolver, FrameBasesService],
    }).compile();

    resolver = module.get<FrameBasesResolver>(FrameBasesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
