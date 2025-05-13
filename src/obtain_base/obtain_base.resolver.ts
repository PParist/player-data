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
import { ObtainBaseService } from './obtain_base.service';
import { ObtainBase } from './entities/obtain_base.entity';
import { CreateObtainBaseInput } from './dto/create-obtain_base.input';
import { UpdateObtainBaseInput } from './dto/update-obtain_base.input';
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
export class PaginatedObtainBases {
  @Field(() => [ObtainBase])
  data: ObtainBase[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@Resolver(() => ObtainBase)
export class ObtainBaseResolver {
  constructor(private readonly obtainBaseService: ObtainBaseService) {}

  @Mutation(() => ObtainBase)
  createObtainBase(
    @Args('createObtainBaseInput') createObtainBaseInput: CreateObtainBaseInput,
  ) {
    return this.obtainBaseService.create(createObtainBaseInput);
  }

  @Query(() => [ObtainBase], { name: 'obtainBases' })
  findAll() {
    return this.obtainBaseService.findAll();
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
