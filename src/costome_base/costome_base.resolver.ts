import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CostomeBaseService } from './costome_base.service';
import { CostomeBase } from './entities/costome_base.entity';
import { CreateCostomeBaseInput } from './dto/create-costome_base.input';
import { UpdateCostomeBaseInput } from './dto/update-costome_base.input';

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

  @Query(() => [CostomeBase], { name: 'costomeBase' })
  findAll() {
    return this.costomeBaseService.findAll();
  }

  @Query(() => CostomeBase, { name: 'costomeBase' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.costomeBaseService.findOne(uuid);
  }

  @Mutation(() => CostomeBase)
  updateCostomeBase(
    @Args('updateCostomeBaseInput')
    updateCostomeBaseInput: UpdateCostomeBaseInput,
  ) {
    return this.costomeBaseService.update(
      updateCostomeBaseInput.uuid,
      updateCostomeBaseInput,
    );
  }

  @Mutation(() => CostomeBase)
  removeCostomeBase(@Args('uuid', { type: () => String }) uuid: string) {
    return this.costomeBaseService.remove(uuid);
  }
}
