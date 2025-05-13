import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { TalentBasesService } from './talent_bases.service';
import { TalentBase } from './entities/talent_base.entity';
import { CreateTalentBaseInput } from './dto/create-talent_base.input';
import { UpdateTalentBaseInput } from './dto/update-talent_base.input';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';

@ObjectType()
export class PaginatedTalentBases extends Paginated(TalentBase) {}

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
  findAll(@Args() paginationArgs?: PaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.talentBasesService.findAllWithOptions(paginationArgs);
    }
    return this.talentBasesService.findAll();
  }

  @Query(() => PaginatedTalentBases, { name: 'paginatedTalentBases' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
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
