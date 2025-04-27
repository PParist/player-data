import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

import { LoginType } from '@prisma/client';
@InputType()
export class LoginInput {
  @Field({ nullable: true })
  //@IsUUID()
  uuid?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  login_token: string;

  @Field(() => LoginType)
  login_type: LoginType;

  @Field({ nullable: true })
  device_uuid?: string;

  @Field({ nullable: true })
  ip_address?: string;

  @Field({ nullable: true })
  //@IsUUID()
  role?: string;

  @Field()
  version?: string;
}
