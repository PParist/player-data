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
import { TalentBasesService } from './talent_bases.service';
import { TalentBase } from './entities/talent_base.entity';
import { CreateTalentBaseInput } from './dto/create-talent_base.input';
import { UpdateTalentBaseInput } from './dto/update-talent_base.input';

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
export class PaginatedTalentBases {
  @Field(() => [TalentBase])
  data: TalentBase[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@Resolver(() => TalentBase)
export class TalentBasesResolver {
  constructor(private readonly talentBasesService: TalentBasesService) {}

  @Mutation(() => TalentBase)
  createTalentBase(
    @Args('createTalentBaseInput') createTalentBaseInput: CreateTalentBaseInput,
  ) {
    return this.talentBasesService.create(createTalentBaseInput);
  }

  @Query(() => PaginatedTalentBases, { name: 'talentBases' })
  findAll(@Args() paginationArgs?: OptionalPaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.talentBasesService.findAllWithOptions(paginationArgs);
    }
    return this.talentBasesService.findAll();
  }

  @Query(() => PaginatedTalentBases, { name: 'paginatedTalentBases' })
  findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
    return this.talentBasesService.findAllWithOptions(paginationArgs);
  }

  @Query(() => TalentBase, { name: 'talentBase' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.talentBasesService.findOne(uuid);
  }

  @Mutation(() => TalentBase)
  updateTalentBase(
    @Args('updateTalentBaseInput') updateTalentBaseInput: UpdateTalentBaseInput,
  ) {
    return this.talentBasesService.update(
      updateTalentBaseInput.uuid,
      updateTalentBaseInput,
    );
  }

  @Mutation(() => TalentBase)
  removeTalentBase(@Args('uuid', { type: () => String }) uuid: string) {
    return this.talentBasesService.remove(uuid);
  }
}
