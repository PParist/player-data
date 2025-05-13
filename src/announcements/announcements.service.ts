import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateAnnouncementInput } from './dto/create-announcement.input';
import { UpdateAnnouncementInput } from './dto/update-announcement.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { CacheLayerService } from '../cache/cache-layer.service';
import {
  OptionalPaginationArgs,
  PaginatedAnnouncements,
} from './announcements.resolver';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getAnnouncementCacheKey(uuid: string): string {
    return `announcement:${uuid}`;
  }

  private getListCacheKey(options?: OptionalPaginationArgs): string {
    if (!options) return 'announcements:all';

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `announcements:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createAnnouncementInput: CreateAnnouncementInput) {
    try {
      const newAnnouncementUuid = uuidv4();
      const announcement = await this.prisma.announcements.create({
        data: {
          uuid: newAnnouncementUuid,
          ...createAnnouncementInput,
          createdAt: new Date(),
          createdBy: newAnnouncementUuid,
          updatedAt: new Date(),
          updatedBy: newAnnouncementUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      await this.cacheService.invalidatePattern('announcements:*');
      return announcement;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create announcement',
        'announcement',
      );
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_ANNOUNCEMENTS || 'all_announcements'}:all`;
      return this.cacheService.gets<PaginatedAnnouncements>(
        cacheKey,
        async () => {
          const announcements = await this.prisma.announcements.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.announcements.count({
            where: { deletedAt: null },
          });

          return {
            data: announcements,
            meta: {
              total: totalCount,
              page: 1,
              limit: totalCount,
              pages: 1,
            },
          };
        },
        CACHE_TTL.LOCAL_FINDALL,
        CACHE_TTL.DISTRIBUTED_FINDALL,
      );
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'find all announcements',
        'announcements',
      );
    }
  }

  async findAllWithOptions(options: OptionalPaginationArgs) {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedAnnouncements>(
        cacheKey,
        async () => {
          const {
            page = 1,
            limit = 100,
            orderBy = 'updatedAt',
            orderDirection = 'desc',
          } = options;

          const skip = (page - 1) * limit;
          const orderOption = {};
          orderOption[orderBy] = orderDirection;

          const [announcements, totalCount] = await Promise.all([
            this.prisma.announcements.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.announcements.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: announcements,
            meta: {
              total: totalCount,
              page,
              limit,
              pages: Math.ceil(totalCount / limit),
            },
          };
        },
        CACHE_TTL.LOCAL_FINDALL,
        CACHE_TTL.DISTRIBUTED_FINDALL,
      );
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'find announcements with options',
        'announcements',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getAnnouncementCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const announcement = await this.prisma.announcements.findUnique({
            where: { uuid },
          });

          if (!announcement) {
            throw new NotFoundException(
              `Announcement with uuid ${uuid} not found`,
            );
          }

          return announcement;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find announcement with uuid ${uuid}`,
        'announcement',
      );
    }
  }

  async update(uuid: string, updateAnnouncementInput: UpdateAnnouncementInput) {
    try {
      const updatedAnnouncement = await this.prisma.announcements.update({
        where: { uuid },
        data: {
          ...updateAnnouncementInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getAnnouncementCacheKey(uuid)),
        this.cacheService.invalidatePattern('announcements:*'),
      ]);

      return updatedAnnouncement;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update announcement with uuid ${uuid}`,
        'announcement',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedAnnouncement = await this.prisma.announcements.delete({
        where: { uuid },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getAnnouncementCacheKey(uuid)),
        this.cacheService.invalidatePattern('announcements:*'),
      ]);

      return deletedAnnouncement;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove announcement with uuid ${uuid}`,
        'announcement',
      );
    }
  }
}
