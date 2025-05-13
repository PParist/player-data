import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateAvatarBaseInput } from './dto/create-avatar_base.input';
import { UpdateAvatarBaseInput } from './dto/update-avatar_base.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { CacheLayerService } from '../cache/cache-layer.service';
import { PaginationArgs } from '../common/pagination/pagination.types';
import { PaginatedAvatarBases } from './avatar_base.resolver';

@Injectable()
export class AvatarBaseService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getAvatarCacheKey(uuid: string): string {
    return `avatar_base:${uuid}`;
  }

  private getListCacheKey(options?: PaginationArgs): string {
    if (!options) return `${CACHE_KEYS.ALL_AVATARBASES}`;

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `avatarbases:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createAvatarBaseInput: CreateAvatarBaseInput) {
    try {
      const newAvatarUuid = uuidv4();
      const avatarBase = await this.prisma.avatarBases.create({
        data: {
          uuid: newAvatarUuid,
          ...createAvatarBaseInput,
          createdAt: new Date(),
          createdBy: newAvatarUuid,
          updatedAt: new Date(),
          updatedBy: newAvatarUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      await this.cacheService.invalidatePattern('avatar_bases:*');
      return avatarBase;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create avatar base',
        'avatarBase',
      );
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_AVATARBASES}`;
      return this.cacheService.gets<PaginatedAvatarBases>(
        cacheKey,
        async () => {
          const avatarBases = await this.prisma.avatarBases.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.avatarBases.count({
            where: { deletedAt: null },
          });

          return {
            data: avatarBases,
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
        'find all avatar bases',
        'avatarBases',
      );
    }
  }

  async findAllWithOptions(options: PaginationArgs) {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedAvatarBases>(
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

          const [avatarBases, totalCount] = await Promise.all([
            this.prisma.avatarBases.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.avatarBases.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: avatarBases,
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
        'find avatar bases with options',
        'avatarBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getAvatarCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const avatarBase = await this.prisma.avatarBases.findUnique({
            where: { uuid },
          });

          if (!avatarBase) {
            throw new NotFoundException(
              `Avatar base with uuid ${uuid} not found`,
            );
          }

          return avatarBase;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find avatar base with uuid ${uuid}`,
        'avatarBase',
      );
    }
  }

  async update(uuid: string, updateAvatarBaseInput: UpdateAvatarBaseInput) {
    try {
      const updatedAvatar = await this.prisma.avatarBases.update({
        where: { uuid },
        data: {
          ...updateAvatarBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getAvatarCacheKey(uuid)),
        this.cacheService.invalidatePattern('avatar_bases:*'),
      ]);

      return updatedAvatar;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update avatar base with uuid ${uuid}`,
        'avatarBase',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedAvatar = await this.prisma.avatarBases.delete({
        where: { uuid },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getAvatarCacheKey(uuid)),
        this.cacheService.invalidatePattern('avatar_bases:*'),
      ]);

      return deletedAvatar;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove avatar base with uuid ${uuid}`,
        'avatarBase',
      );
    }
  }
}
