import { BaseModel } from '@app/common/models/base.model';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FrameBase extends BaseModel {
  @Field(() => String, { description: 'Image' })
  imageUrl: string;

  @Field(() => String, { description: 'Obtain Base Uuid', nullable: true })
  obtainsBaseUuid?: string;
}
