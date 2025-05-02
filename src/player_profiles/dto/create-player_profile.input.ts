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
    description: 'URL to player profile image',
  })
  imageUrl?: string;

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

  @Field(() => Int, { description: 'Golden poring coin currency' })
  goldenPoringCoin: number;

  @Field(() => Int, { description: 'Poring coin currency' })
  poringCoin: number;

  @Field(() => Int, { description: 'Gachapon tickets' })
  gachaponTicket: number;
}
