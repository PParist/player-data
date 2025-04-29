import { IsUUID } from 'class-validator';
import { CreateObtainBaseInput } from './create-obtain_base.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateObtainBaseInput extends PartialType(CreateObtainBaseInput) {
  @Field(() => String)
  @IsUUID()
  uuid: string
}
