import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { FrameBasesService } from './frame_bases.service';
import { FrameBase } from './entities/frame_base.entity';
import { CreateFrameBaseInput } from './dto/create-frame_base.input';
import { UpdateFrameBaseInput } from './dto/update-frame_base.input';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';
@ObjectType()
export class PaginatedFrameBases extends Paginated(FrameBase) {}

@Resolver(() => FrameBase)
export class FrameBasesResolver {
  constructor(private readonly frameBasesService: FrameBasesService) {}

  @Mutation(() => FrameBase)
  createFrameBase(
    @Args('createFrameBaseInput') createFrameBaseInput: CreateFrameBaseInput,
  ) {
    return this.frameBasesService.create(createFrameBaseInput);
  }

  @Query(() => PaginatedFrameBases, { name: 'frameBases' })
  findAll(@Args() paginationArgs?: PaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.frameBasesService.findAllWithOptions(paginationArgs);
    }
    return this.frameBasesService.findAll();
  }

  @Query(() => PaginatedFrameBases, { name: 'paginatedFrameBases' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
    return this.frameBasesService.findAllWithOptions(paginationArgs);
  }

  @Query(() => FrameBase, { name: 'frameBase' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.frameBasesService.findOne(uuid);
  }

  @Mutation(() => FrameBase)
  updateFrameBase(
    @Args('updateFrameBaseInput') updateFrameBaseInput: UpdateFrameBaseInput,
  ) {
    return this.frameBasesService.update(
      updateFrameBaseInput.uuid,
      updateFrameBaseInput,
    );
  }

  @Mutation(() => FrameBase)
  removeFrameBase(@Args('uuid', { type: () => String }) uuid: string) {
    return this.frameBasesService.remove(uuid);
  }
}
