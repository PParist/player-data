import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { ObtainBaseService } from './obtain_base.service';
import { ObtainBase } from './entities/obtain_base.entity';
import { CreateObtainBaseInput } from './dto/create-obtain_base.input';
import { UpdateObtainBaseInput } from './dto/update-obtain_base.input';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';

@ObjectType()
export class PaginatedObtainBases extends Paginated(ObtainBase) {}

@Resolver(() => ObtainBase)
export class ObtainBaseResolver {
  constructor(private readonly obtainBaseService: ObtainBaseService) {}

  @Mutation(() => ObtainBase)
  createObtainBase(
    @Args('createObtainBaseInput') createObtainBaseInput: CreateObtainBaseInput,
  ) {
    return this.obtainBaseService.create(createObtainBaseInput);
  }

  @Query(() => PaginatedObtainBases, { name: 'obtainBases' })
  findAll(@Args() paginationArgs?: PaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.obtainBaseService.findAllWithOptions(paginationArgs);
    }
    return this.obtainBaseService.findAll();
  }

  @Query(() => PaginatedObtainBases, { name: 'paginatedObtainBases' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
    return this.obtainBaseService.findAllWithOptions(paginationArgs);
  }

  @Query(() => ObtainBase, { name: 'obtainBase' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.obtainBaseService.findOne(uuid);
  }

  @Mutation(() => ObtainBase)
  updateObtainBase(
    @Args('updateObtainBaseInput') updateObtainBaseInput: UpdateObtainBaseInput,
  ) {
    return this.obtainBaseService.update(
      updateObtainBaseInput.uuid,
      updateObtainBaseInput,
    );
  }

  @Mutation(() => ObtainBase)
  removeObtainBase(@Args('uuid', { type: () => String }) uuid: string) {
    return this.obtainBaseService.remove(uuid);
  }
}
