import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreatePlayerProfileInput {
  @Field(() => String, { nullable: true, description: 'User account UUID' })
  userAccountUuid?: string;

  @Field(() => String, { description: 'Player profile name' })
  name: string;

  @Field(() => String, {
    nullable: true,
    description: 'Player profile description',
  })
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'URL to player profile avatar',
  })
  avatar_url?: string;

  @Field(() => String, {
    nullable: true,
    description: 'URL to player profile frame',
  })
  frame_url?: string;

  @Field(() => Int, { description: 'Player level' })
  level: number;

  @Field(() => Int, { description: 'Player experience points' })
  exp: number;

  @Field(() => Int, { description: 'Current mana points' })
  currentMana: number;

  @Field(() => Int, { description: 'Maximum mana points' })
  maxMana: number;

  @Field(() => Int, { description: 'Player currency (Zeny)' })
  zeny: number;

  @Field(() => Int, { description: 'Crystal shard currency' })
  crystalShard: number;
}
