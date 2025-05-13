import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateObtainBaseInput {
  @Field(() => String, { description: 'obtains_type', nullable: true })
  obtains_type?: string;

  @Field(() => String, { description: 'tpyes_uuid', nullable: true })
  types_uuid?: string;

  @Field(() => String, { description: 'info', nullable: true })
  info?: string;
}
