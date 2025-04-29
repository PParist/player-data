import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Name  {
  @Field(() => String, { description: 'Player profile name' })
  name: string;
}