import { CreateFrameBaseInput } from './create-frame_base.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFrameBaseInput extends PartialType(CreateFrameBaseInput) {
  @Field(() => String)
  uuid: string;
}
