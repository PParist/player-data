import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { CostomeBaseService } from './costome_base.service';
import { CostomeBase } from './entities/costome_base.entity';
import { CreateCostomeBaseInput } from './dto/create-costome_base.input';
import { UpdateCostomeBaseInput } from './dto/update-costome_base.input';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';
@ObjectType()
export class PaginatedCostomeBases extends Paginated(CostomeBase) {}

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

  @Query(() => PaginatedCostomeBases, { name: 'costomeBases' })
  findAll(@Args() paginationArgs?: PaginationArgs) {
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

  @Query(() => PaginatedCostomeBases, { name: 'paginatedCostomeBases' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
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
