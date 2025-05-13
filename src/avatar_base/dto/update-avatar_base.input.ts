import { CreateAvatarBaseInput } from './create-avatar_base.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAvatarBaseInput extends PartialType(CreateAvatarBaseInput) {
  @Field(() => String)
  uuid: string;
}
