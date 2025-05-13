import { Test, TestingModule } from '@nestjs/testing';
import { FrameBasesService } from './frame_bases.service';

describe('FrameBasesService', () => {
  let service: FrameBasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrameBasesService],
    }).compile();

    service = module.get<FrameBasesService>(FrameBasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
