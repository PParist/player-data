import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementInput } from './dto/create-announcement.input';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';
import {
  PaginationArgs,
  Paginated,
} from '../common/pagination/pagination.types';
@ObjectType()
export class PaginatedAnnouncements extends Paginated(Announcement) {}

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
  findAll(@Args() paginationArgs?: PaginationArgs) {
    if (paginationArgs && Object.keys(paginationArgs).length > 0) {
      return this.announcementsService.findAllWithOptions(paginationArgs);
    }
    return this.announcementsService.findAll();
  }

  @Query(() => PaginatedAnnouncements, { name: 'paginatedAnnouncements' })
  findAllPaginated(@Args() paginationArgs: PaginationArgs) {
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
