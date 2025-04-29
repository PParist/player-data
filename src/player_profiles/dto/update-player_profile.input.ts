import { CreatePlayerProfileInput } from './create-player_profile.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePlayerProfileInput extends PartialType(CreatePlayerProfileInput) {
  @Field(() => String)
  uuid: string;
}
