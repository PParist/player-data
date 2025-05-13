import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ArgsType,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { AvatarBaseService } from './avatar_base.service';
import { AvatarBase } from './entities/avatar_base.entity';
import { CreateAvatarBaseInput } from './dto/create-avatar_base.input';
import { UpdateAvatarBaseInput } from './dto/update-avatar_base.input';

@ArgsType()
export class OptionalPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'updatedAt' })
  orderBy?: string;

  @Field(() => String, { nullable: true, defaultValue: 'desc' })
  orderDirection?: string;
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  pages: number;
}

@ObjectType()
export class PaginatedAvatarBases {
  @Field(() => [AvatarBase])
  data: AvatarBase[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

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
  findAll(@Args() paginationArgs?: OptionalPaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.avatarBaseService.findAllWithOptions(paginationArgs);
    }
    return this.avatarBaseService.findAll();
  }

  @Query(() => PaginatedAvatarBases, { name: 'paginatedAvatarBases' })
  findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
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
