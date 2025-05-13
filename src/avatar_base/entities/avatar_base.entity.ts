import { ObjectType, Field } from '@nestjs/graphql';
import { BaseModel } from 'src/common/models/base.model';

@ObjectType()
export class AvatarBase extends BaseModel {
  @Field(() => String, { description: 'Image' })
  imageUrl: string;

  @Field(() => String, { description: 'Obtain Base Uuid', nullable: true })
  obtainsBaseUuid?: string;
}
