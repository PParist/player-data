import { BaseModel } from '@app/common/models/base.model';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Announcement extends BaseModel {
  @Field(() => String, {
    description: 'info',
  })
  info: string;

  @Field(() => String, {
    description: 'URL to image avatar',
  })
  image: string;
}
