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
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementInput } from './dto/create-announcement.input';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';

@ArgsType()
export class OptionalPaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'updatedAt' })
  orderBy?: string;

  @Field(() => String, { nullable: true, defaultValue: 'desc' })
  orderDirection?: string;
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
export class PaginatedAnnouncements {
  @Field(() => [Announcement])
  data: Announcement[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@Resolver(() => Announcement)
export class AnnouncementsResolver {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Mutation(() => Announcement)
  createAnnouncement(
    @Args('createAnnouncementInput')
    createAnnouncementInput: CreateAnnouncementInput,
  ) {
    return this.announcementsService.create(createAnnouncementInput);
  }

  @Query(() => PaginatedAnnouncements, { name: 'announcements' })
  findAll(@Args() paginationArgs?: OptionalPaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.announcementsService.findAllWithOptions(paginationArgs);
    }
    return this.announcementsService.findAll();
  }

  @Query(() => PaginatedAnnouncements, { name: 'paginatedAnnouncements' })
  findAllPaginated(@Args() paginationArgs: OptionalPaginationArgs) {
    return this.announcementsService.findAllWithOptions(paginationArgs);
  }

  @Query(() => Announcement, { name: 'announcement' })
  findOne(@Args('uuid', { type: () => String }) uuid: string) {
    return this.announcementsService.findOne(uuid);
  }

  @Mutation(() => Announcement)
  updateAnnouncement(
    @Args('updateAnnouncementInput')
    updateAnnouncementInput: UpdateAnnouncementInput,
  ) {
    return this.announcementsService.update(
      updateAnnouncementInput.uuid,
      updateAnnouncementInput,
    );
  }

  @Mutation(() => Announcement)
  removeAnnouncement(@Args('uuid', { type: () => String }) uuid: string) {
    return this.announcementsService.remove(uuid);
  }
}
