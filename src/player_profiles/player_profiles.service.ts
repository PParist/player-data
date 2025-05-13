import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreatePlayerProfileInput } from './dto/create-player_profile.input';
import { UpdatePlayerProfileInput } from './dto/update-player_profile.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { generateSuperUniquePlayerName } from 'src/common/utils/random';
import { CacheLayerService } from '../cache/cache-layer.service';
import { PaginationArgs } from '../common/pagination/pagination.types';
import { PaginatedPlayerProfiles } from './player_profiles.resolver';
import { MessageQueueService } from '../message_queue/message_queue.service';
@Injectable()
export class PlayerProfilesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
    private readonly messageQueue: MessageQueueService,
  ) {}

  private getProfileCacheKey(uuid: string): string {
    return `player_profile:${uuid}`;
  }

  private getListCacheKey(options?: PaginationArgs): string {
    if (!options) return 'player_profiles:all';

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `player_profiles:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createPlayerProfileInput: CreatePlayerProfileInput) {
    try {
      const newProfileUuid = uuidv4();
      const playerProfile = await this.prisma.playerProfiles.create({
        data: {
          uuid: newProfileUuid,
          ...createPlayerProfileInput,
          createdAt: new Date(),
          createdBy: newProfileUuid,
          updatedAt: new Date(),
          updatedBy: newProfileUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      await this.cacheService.invalidatePattern('player_profiles:*');

      return playerProfile;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create player profile',
        'playerProfile',
      );
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_PROFILES}:all`;
      return this.cacheService.gets<PaginatedPlayerProfiles>(
        cacheKey,
        async () => {
          const profiles = await this.prisma.playerProfiles.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.playerProfiles.count({
            where: { deletedAt: null },
          });

          const result = {
            data: profiles,
            meta: {
              total: totalCount,
              page: 1,
              limit: totalCount,
              pages: 1,
            },
          };

          return result;
        },
        CACHE_TTL.LOCAL_FINDALL,
        CACHE_TTL.DISTRIBUTED_FINDALL,
      );
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'find all player profiles',
        'playerProfiles',
      );
    }
  }

  async findAllWithOptions(
    options: PaginationArgs,
  ): Promise<PaginatedPlayerProfiles> {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedPlayerProfiles>(
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

          const [profiles, totalCount] = await Promise.all([
            this.prisma.playerProfiles.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.playerProfiles.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: profiles,
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
        'find player profiles with options',
        'playerProfiles',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getProfileCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const playerProfile = await this.prisma.playerProfiles.findUnique({
            where: { uuid },
          });

          if (!playerProfile) {
            throw new NotFoundException(
              `Player profile with uuid ${uuid} not found`,
            );
          }

          return playerProfile;
        },
        CACHE_TTL.LOCAL_FINDONE, // TTL 10 นาที
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find player profile with uuid ${uuid}`,
        'playerProfile',
      );
    }
  }

  async update(
    uuid: string,
    updatePlayerProfileInput: UpdatePlayerProfileInput,
  ) {
    try {
      const updatedProfile = await this.prisma.playerProfiles.update({
        where: { uuid },
        data: {
          ...updatePlayerProfileInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      // ล้าง cache ที่เกี่ยวข้อง
      await Promise.all([
        this.cacheService.invalidate(this.getProfileCacheKey(uuid)),
        this.cacheService.invalidatePattern('player_profiles:*'),
      ]);

      return updatedProfile;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update player profile with uuid ${uuid}`,
        'playerProfile',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedProfile = await this.prisma.playerProfiles.delete({
        where: { uuid },
      });

      // ล้าง cache ที่เกี่ยวข้อง
      await Promise.all([
        this.cacheService.invalidate(this.getProfileCacheKey(uuid)),
        this.cacheService.invalidatePattern('player_profiles:*'),
      ]);

      return deletedProfile;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove player profile with uuid ${uuid}`,
        'playerProfile',
      );
    }
  }

  async randomPlayerProfileName(): Promise<string> {
    const generatedName = generateSuperUniquePlayerName();

    const existingProfile = await this.prisma.playerProfiles.findFirst({
      where: { name: generatedName },
    });

    if (existingProfile) {
      return this.randomPlayerProfileName();
    }
    return generatedName;
  }
}
