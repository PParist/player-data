import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ObtainBaseService } from './obtain_base.service';
import { ObtainBase } from './entities/obtain_base.entity';
import { CreateObtainBaseInput } from './dto/create-obtain_base.input';
import { UpdateObtainBaseInput } from './dto/update-obtain_base.input';

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
