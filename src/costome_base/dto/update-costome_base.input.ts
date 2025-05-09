import { CreateCostomeBaseInput } from './create-costome_base.input';
import { IsUUID } from 'class-validator';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCostomeBaseInput extends PartialType(
  CreateCostomeBaseInput,
) {
  @Field(() => String)
  @IsUUID()
  uuid: string;
}
