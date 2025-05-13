import { Test, TestingModule } from '@nestjs/testing';
import { AvatarBaseService } from './avatar_base.service';

describe('AvatarBaseService', () => {
  let service: AvatarBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarBaseService],
    }).compile();

    service = module.get<AvatarBaseService>(AvatarBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
