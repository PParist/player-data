import { BaseModel } from '@app/common/models/base.model';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TalentBase extends BaseModel {
  @Field(() => Int, { description: 'stage' })
  stage: number;

  @Field(() => String, { description: 'type' })
  type: string;

  @Field(() => Int, { description: 'level max' })
  levelMax: number;

  @Field(() => String, { description: 'stat' })
  stat: string;

  @Field(() => Int, { description: 'skill point' })
  skillPoint: number;

  @Field(() => Int, { description: 'zeny spend' })
  zenySpend: number;

  @Field(() => String, {
    nullable: true,
    description: 'image parth (misspelled path)',
  })
  imageParth?: string;

  @Field(() => String, { description: 'name' })
  name: string;

  @Field(() => String, { nullable: true, description: 'detail' })
  detail?: string;

  @Field(() => Int, { description: 'is active' })
  isActive: number;
}
