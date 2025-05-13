import { Test, TestingModule } from '@nestjs/testing';
import { AvatarBaseResolver } from './avatar_base.resolver';
import { AvatarBaseService } from './avatar_base.service';

describe('AvatarBaseResolver', () => {
  let resolver: AvatarBaseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarBaseResolver, AvatarBaseService],
    }).compile();

    resolver = module.get<AvatarBaseResolver>(AvatarBaseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
