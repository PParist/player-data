import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateFrameBaseInput {
  @Field(() => String, {
    description: 'URL to image avatar',
  })
  imageUrl: string;

  @Field(() => String, { description: 'Obtain Base Uuid' })
  @IsUUID()
  obtainsBaseUuid: string;
}
