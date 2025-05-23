import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  roleUuid?: string;
}
