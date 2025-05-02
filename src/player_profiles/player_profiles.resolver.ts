import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ArgsType,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { PlayerProfilesService } from './player_profiles.service';
import { PlayerProfile } from './entities/player_profile.entity';
import { CreatePlayerProfileInput } from './dto/create-player_profile.input';
import { UpdatePlayerProfileInput } from './dto/update-player_profile.input';
import { Name } from './entities/random_profile_name';
import { OrderDirection } from '../common/order/order-direction';

@ArgsType()
export class OptionalPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'updatedAt' })
  orderBy?: string;

  @Field(() => OrderDirection, {
    nullable: true,
    defaultValue: OrderDirection.desc,
  })
  orderDirection?: OrderDirection;
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  pages: number;
}

@ObjectType()
export class PaginatedPlayerProfiles {
  @Field(() => [PlayerProfile])
  data: PlayerProfile[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

// @ObjectType()
// class PlayerProfileConnection extends Paginated(PlayerProfile) {}

@Resolver(() => PlayerProfile)
export class PlayerProfilesResolver {
  constructor(private readonly playerProfilesService: PlayerProfilesService) {}

  @Mutation(() => PlayerProfile)
  createPlayerProfile(
    @Args('createPlayerProfileInput')
    createPlayerProfileInput: CreatePlayerProfileInput,
  ) {
    return this.playerProfilesService.create(createPlayerProfileInput);
  }

  @Query(() => PaginatedPlayerProfiles, { name: 'playerProfiles' })
  findAll(@Args() paginationArgs?: OptionalPaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.playerProfilesService.findAllWithOptions(paginationArgs);
    }
    return this.playerProfilesService.findAll();
  }

  @Query(() => PaginatedPlayerProfiles, { name: 'paginatedPlayerProfiles' })
  findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
    return this.playerProfilesService.findAllWithOptions(paginationArgs);
  }

  @Query(() => PlayerProfile, { name: 'playerProfile' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.playerProfilesService.findOne(uuid);
  }

  @Query(() => Name, { name: 'randomPlayerName' })
  async randomPlayerName(): Promise<Name> {
    try {
      console.log('Generating a random player name');
      const randomName =
        await this.playerProfilesService.randomPlayerProfileName();
      return { name: randomName };
    } catch (error) {
      console.error('Error generating random player name:', error);
      throw error;
    }
  }

  @Mutation(() => PlayerProfile)
  updatePlayerProfile(
    @Args('updatePlayerProfileInput')
    updatePlayerProfileInput: UpdatePlayerProfileInput,
  ) {
    return this.playerProfilesService.update(
      updatePlayerProfileInput.uuid,
      updatePlayerProfileInput,
    );
  }

  @Mutation(() => PlayerProfile)
  removePlayerProfile(@Args('uuid', { type: () => String }) uuid: string) {
    return this.playerProfilesService.remove(uuid);
  }
}
