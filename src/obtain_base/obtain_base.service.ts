import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateObtainBaseInput } from './dto/create-obtain_base.input';
import { UpdateObtainBaseInput } from './dto/update-obtain_base.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { CacheLayerService } from '../cache/cache-layer.service';
import { PaginationArgs } from '../common/pagination/pagination.types';
import { PaginatedObtainBases } from './obtain_base.resolver';

@Injectable()
export class ObtainBaseService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getObtainCacheKey(uuid: string): string {
    return `obtain_base:${uuid}`;
  }

  private getListCacheKey(options?: PaginationArgs): string {
    if (!options) return 'obtain_bases:all';

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `obtain_bases:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createObtainBaseInput: CreateObtainBaseInput) {
    try {
      const newObtainUuid = uuidv4();
      const obtainBase = await this.prisma.obtainBases.create({
        data: {
          uuid: newObtainUuid,
          ...createObtainBaseInput,
          createdAt: new Date(),
          createdBy: newObtainUuid,
          updatedAt: new Date(),
          updatedBy: newObtainUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      // Invalidate cache after creating a new obtain base
      await this.cacheService.invalidatePattern('obtain_bases:*');

      return obtainBase;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create obtain base',
        'obtainBase',
      );
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_OBTAINBASES || 'all_obtains'}:all`;
      return this.cacheService.gets<PaginatedObtainBases>(
        cacheKey,
        async () => {
          const obtainBases = await this.prisma.obtainBases.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.obtainBases.count({
            where: { deletedAt: null },
          });

          return {
            data: obtainBases,
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
        'find all obtain bases',
        'obtainBases',
      );
    }
  }

  async findAllWithOptions(options: PaginationArgs) {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedObtainBases>(
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

          const [obtainBases, totalCount] = await Promise.all([
            this.prisma.obtainBases.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.obtainBases.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: obtainBases,
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
        'find obtain bases with options',
        'obtainBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getObtainCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const obtainBase = await this.prisma.obtainBases.findUnique({
            where: { uuid },
          });

          if (!obtainBase) {
            throw new NotFoundException(
              `Obtain base with uuid ${uuid} not found`,
            );
          }

          return obtainBase;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find obtain base with uuid ${uuid}`,
        'obtainBase',
      );
    }
  }

  async update(uuid: string, updateObtainBaseInput: UpdateObtainBaseInput) {
    try {
      const updatedObtain = await this.prisma.obtainBases.update({
        where: { uuid },
        data: {
          ...updateObtainBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      // Clear related caches
      await Promise.all([
        this.cacheService.invalidate(this.getObtainCacheKey(uuid)),
        this.cacheService.invalidatePattern('obtain_bases:*'),
      ]);

      return updatedObtain;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update obtain base with uuid ${uuid}`,
        'obtainBase',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedObtain = await this.prisma.obtainBases.delete({
        where: { uuid },
      });

      // Clear related caches
      await Promise.all([
        this.cacheService.invalidate(this.getObtainCacheKey(uuid)),
        this.cacheService.invalidatePattern('obtain_bases:*'),
      ]);

      return deletedObtain;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove obtain base with uuid ${uuid}`,
        'obtainBase',
      );
    }
  }
}
