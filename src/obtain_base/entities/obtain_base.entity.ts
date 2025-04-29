import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BaseModel } from 'src/common/models/base.model';

@ObjectType()
export class ObtainBase extends BaseModel {
  @Field(() => String, { description: 'obtains_type', nullable: true })
  obtains_type?: string;

  @Field(() => String, { description: 'tpyes_uuid', nullable: true })
  types_uuid?: string;

  @Field(() => String, { description: 'info', nullable: true })
  info?: string;
}
