import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCostomeBaseInput {
  @Field(() => String, { description: 'Equipment ID' })
  equimentID: string;

  @Field(() => String, { description: 'Equipment Name', nullable: true })
  name: string;

  @Field(() => String, { description: 'Equipment Info', nullable: true })
  info: string;

  @Field(() => String, { description: 'Obtain Base Uuid', nullable: true })
  obtainBaseUuid?: string;

  @Field(() => String, { description: 'Image Path', nullable: true })
  imagePath?: string;

  @Field(() => String, { description: 'Prefab Path', nullable: true })
  prefabPath?: string;

  @Field(() => Int, { description: 'Equioment Type' })
  equipmentType: number;

  @Field(() => Int, { description: 'Model' })
  model: number;

  @Field(() => Int, { description: 'Tier' })
  tier: number;

  @Field(() => Int, { description: 'Is Active' })
  isActive: number;

  @Field(() => Int, { description: 'Is Default' })
  isDefault: number;

  @Field(() => Int, { description: 'Is Colorable' })
  isColorable: number;

  @Field(() => String, { description: 'Colors', nullable: true })
  colors?: string;
}
