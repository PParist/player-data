import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAnnouncementInput {
  @Field(() => String, {
    description: 'info',
  })
  info: string;

  @Field(() => String, {
    description: 'URL to image avatar',
  })
  image: string;
}
