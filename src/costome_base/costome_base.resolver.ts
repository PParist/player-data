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
import { CostomeBaseService } from './costome_base.service';
import { CostomeBase } from './entities/costome_base.entity';
import { CreateCostomeBaseInput } from './dto/create-costome_base.input';
import { UpdateCostomeBaseInput } from './dto/update-costome_base.input';
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
export class PaginatedCustomeBases {
  @Field(() => [CostomeBase])
  data: CostomeBase[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@Resolver(() => CostomeBase)
export class CostomeBaseResolver {
  constructor(private readonly costomeBaseService: CostomeBaseService) {}

  @Mutation(() => CostomeBase)
  createCostomeBase(
    @Args('createCostomeBaseInput')
    createCostomeBaseInput: CreateCostomeBaseInput,
  ) {
    return this.costomeBaseService.create(createCostomeBaseInput);
  }

  @Query(() => PaginatedCustomeBases, { name: 'costomeBases' })
  findAll(@Args() paginationArgs?: OptionalPaginationArgs) {
    try {
      if (paginationArgs && Object.keys(paginationArgs).length > 0) {
        return this.costomeBaseService.findAllWithOptions(paginationArgs);
      }
      return this.costomeBaseService.findAll();
    } catch (error) {
      console.error('Error fetching costume bases:', error);
      throw error;
    }
  }

  @Query(() => PaginatedCustomeBases, { name: 'paginatedCostomeBases' })
  findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
    try {
      return this.costomeBaseService.findAllWithOptions(paginationArgs);
    } catch (error) {
      console.error('Error fetching paginated costume bases:', error);
      throw error;
    }
  }

  @Query(() => CostomeBase, { name: 'costomeBase' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    try {
      return this.costomeBaseService.findOne(uuid);
    } catch (error) {
      console.error(`Error fetching costume base with uuid ${uuid}:`, error);
      throw error;
    }
  }

  @Mutation(() => CostomeBase)
  updateCostomeBase(
    @Args('updateCostomeBaseInput')
    updateCostomeBaseInput: UpdateCostomeBaseInput,
  ) {
    try {
      return this.costomeBaseService.update(
        updateCostomeBaseInput.uuid,
        updateCostomeBaseInput,
      );
    } catch (error) {
      console.error('Error updating costume base:', error);
      throw error;
    }
  }

  @Mutation(() => CostomeBase)
  removeCostomeBase(@Args('uuid', { type: () => String }) uuid: string) {
    try {
      return this.costomeBaseService.remove(uuid);
    } catch (error) {
      console.error(`Error removing costume base with uuid ${uuid}:`, error);
      throw error;
    }
  }

  // Add additional query for finding by equipment ID
  @Query(() => CostomeBase, { name: 'costomeBaseByEquipmentId' })
  findByEquipmentId(
    @Args('equipmentId', { type: () => String }) equipmentId: string,
  ) {
    try {
      return this.costomeBaseService.findByEquipmentId(equipmentId);
    } catch (error) {
      console.error(
        `Error fetching costume base with equipment ID ${equipmentId}:`,
        error,
      );
      throw error;
    }
  }
}
