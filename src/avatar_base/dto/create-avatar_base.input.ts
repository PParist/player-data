import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class CreateAvatarBaseInput {
  @Field(() => String, {
    description: 'URL to image avatar',
  })
  imageUrl: string;

  @Field(() => String, { description: 'Obtain Base Uuid' })
  @IsUUID()
  obtainsBaseUuid: string;
}
