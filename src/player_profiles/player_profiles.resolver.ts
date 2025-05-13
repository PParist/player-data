import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { PlayerProfilesService } from './player_profiles.service';
import { PlayerProfile } from './entities/player_profile.entity';
import { CreatePlayerProfileInput } from './dto/create-player_profile.input';
import { UpdatePlayerProfileInput } from './dto/update-player_profile.input';
import { Name } from './entities/random_profile_name';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';

@ObjectType()
export class PaginatedPlayerProfiles extends Paginated(PlayerProfile) {}

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
  findAll(@Args() paginationArgs?: PaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.playerProfilesService.findAllWithOptions(paginationArgs);
    }
    return this.playerProfilesService.findAll();
  }

  @Query(() => PaginatedPlayerProfiles, { name: 'paginatedPlayerProfiles' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
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
