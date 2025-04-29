import { InputType, Int, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateObtainBaseInput {
  @Field(() => String, { description: 'obtains_type', nullable: true })
  obtains_type?: string;

  @Field(() => String, { description: 'tpyes_uuid', nullable: true })
  types_uuid?: string;

  @Field(() => String, { description: 'info', nullable: true })
  info?: string;
}
