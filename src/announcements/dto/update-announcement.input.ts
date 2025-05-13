import { CreateAnnouncementInput } from './create-announcement.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAnnouncementInput extends PartialType(
  CreateAnnouncementInput,
) {
  @Field(() => String)
  uuid: string;
}
