import { Field, ObjectType, ID, Directive } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  uuid: string;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @Directive('@auth(rule: admin)')
  createdBy?: string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  @Directive('@auth(rule: admin)')
  updatedBy?: string;

  @Field(() => Date, { nullable: true })
  @Directive('@auth(rule: admin)')
  deletedAt?: Date;

  @Field(() => String, { nullable: true })
  @Directive('@auth(rule: admin)')
  deletedBy?: string;

  @Field(() => Number, { nullable: true })
  version?: number;
}
