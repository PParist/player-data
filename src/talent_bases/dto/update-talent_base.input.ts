import { CreateTalentBaseInput } from './create-talent_base.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTalentBaseInput extends PartialType(CreateTalentBaseInput) {
  @Field(() => String)
  uuid: string;
}
