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
import { FrameBasesService } from './frame_bases.service';
import { FrameBase } from './entities/frame_base.entity';
import { CreateFrameBaseInput } from './dto/create-frame_base.input';
import { UpdateFrameBaseInput } from './dto/update-frame_base.input';
import { OrderDirection } from '../common/order/order-direction';

@ArgsType()
export class OptionalPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'updatedAt' })
  orderBy?: string;

  @Field(() => OrderDirection, {
    nullable: true,
    defaultValue: OrderDirection.desc,
  })
  orderDirection?: OrderDirection;
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
export class PaginatedFrameBases {
  @Field(() => [FrameBase])
  data: FrameBase[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

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
  findAll(@Args() paginationArgs?: OptionalPaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.frameBasesService.findAllWithOptions(paginationArgs);
    }
    return this.frameBasesService.findAll();
  }

  @Query(() => PaginatedFrameBases, { name: 'paginatedFrameBases' })
  findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
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
