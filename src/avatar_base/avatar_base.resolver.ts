import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { AvatarBaseService } from './avatar_base.service';
import { AvatarBase } from './entities/avatar_base.entity';
import { CreateAvatarBaseInput } from './dto/create-avatar_base.input';
import { UpdateAvatarBaseInput } from './dto/update-avatar_base.input';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';
@ObjectType()
export class PaginatedAvatarBases extends Paginated(AvatarBase) {}

@Resolver(() => AvatarBase)
export class AvatarBaseResolver {
  constructor(private readonly avatarBaseService: AvatarBaseService) {}

  @Mutation(() => AvatarBase)
  createAvatarBase(
    @Args('createAvatarBaseInput') createAvatarBaseInput: CreateAvatarBaseInput,
  ) {
    return this.avatarBaseService.create(createAvatarBaseInput);
  }

  @Query(() => PaginatedAvatarBases, { name: 'avatarBases' })
  findAll(@Args() paginationArgs?: PaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.avatarBaseService.findAllWithOptions(paginationArgs);
    }
    return this.avatarBaseService.findAll();
  }

  @Query(() => PaginatedAvatarBases, { name: 'paginatedAvatarBases' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
    return this.avatarBaseService.findAllWithOptions(paginationArgs);
  }

  @Query(() => AvatarBase, { name: 'avatarBase' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.avatarBaseService.findOne(uuid);
  }

  @Mutation(() => AvatarBase)
  updateAvatarBase(
    @Args('updateAvatarBaseInput') updateAvatarBaseInput: UpdateAvatarBaseInput,
  ) {
    return this.avatarBaseService.update(
      updateAvatarBaseInput.uuid,
      updateAvatarBaseInput,
    );
  }

  @Mutation(() => AvatarBase)
  removeAvatarBase(@Args('uuid', { type: () => String }) uuid: string) {
    return this.avatarBaseService.remove(uuid);
  }
}
