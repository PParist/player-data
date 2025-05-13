import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { OrderDirection } from '../order/order-direction';
import { Type } from '@nestjs/common';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'updatedAt' })
  orderBy?: string;

  @Field(() => OrderDirection, {
    nullable: true,
    defaultValue: OrderDirection.desc,
  })
  orderDirection?: OrderDirection;
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  pages: number;
}

// Generic function to create paginated types
export function Paginated<T>(classRef: Type<T>): Type<any> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef])
    data: T[];

    @Field(() => PaginationMeta)
    meta: PaginationMeta;
  }

  return PaginatedType as Type<{ data: T[]; meta: PaginationMeta }>;
}
