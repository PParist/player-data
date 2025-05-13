import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateCostomeBaseInput } from './dto/create-costome_base.input';
import { UpdateCostomeBaseInput } from './dto/update-costome_base.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { CacheLayerService } from '../cache/cache-layer.service';
import {
  OptionalPaginationArgs,
  PaginatedCustomeBases,
} from './costome_base.resolver';

@Injectable()
export class CostomeBaseService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getCostomeCacheKey(uuid: string): string {
    return `costume_base:${uuid}`;
  }

  private getListCacheKey(options?: OptionalPaginationArgs): string {
    if (!options) return 'costume_bases:all';

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `costume_bases:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createCostomeBaseInput: CreateCostomeBaseInput) {
    try {
      const newCostumeUuid = uuidv4();
      const costumeBase = await this.prisma.costumeBases.create({
        data: {
          uuid: newCostumeUuid,
          ...createCostomeBaseInput,
          createdAt: new Date(),
          createdBy: newCostumeUuid,
          updatedAt: new Date(),
          updatedBy: newCostumeUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
          equipmentId: createCostomeBaseInput.equimentID,
          equipType: createCostomeBaseInput.equipmentType,
        },
      });

      // Invalidate cache after creating a new costume base
      await this.cacheService.invalidatePattern('costume_bases:*');

      return costumeBase;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create costume base',
        'costumeBase',
      );
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_CONSUMEBASES || 'all_costumes'}:all`;
      return this.cacheService.gets<PaginatedCustomeBases>(
        cacheKey,
        async () => {
          const costumeBases = await this.prisma.costumeBases.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.costumeBases.count({
            where: { deletedAt: null },
          });
          return {
            data: costumeBases,
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
        'find all costume bases',
        'costumeBases',
      );
    }
  }

  async findAllWithOptions(options: OptionalPaginationArgs) {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedCustomeBases>(
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

          const [costumeBases, totalCount] = await Promise.all([
            this.prisma.costumeBases.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.costumeBases.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: costumeBases,
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
        'find costume bases with options',
        'costumeBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getCostomeCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const costumeBase = await this.prisma.costumeBases.findUnique({
            where: { uuid },
          });

          if (!costumeBase) {
            throw new NotFoundException(
              `Costume base with uuid ${uuid} not found`,
            );
          }

          return costumeBase;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find costume base with uuid ${uuid}`,
        'costumeBase',
      );
    }
  }

  async update(uuid: string, updateCostomeBaseInput: UpdateCostomeBaseInput) {
    try {
      const updatedCostume = await this.prisma.costumeBases.update({
        where: { uuid },
        data: {
          ...updateCostomeBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      // Clear related caches
      await Promise.all([
        this.cacheService.invalidate(this.getCostomeCacheKey(uuid)),
        this.cacheService.invalidatePattern('costume_bases:*'),
      ]);

      return updatedCostume;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update costume base with uuid ${uuid}`,
        'costumeBase',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedCostume = await this.prisma.costumeBases.delete({
        where: { uuid },
      });

      // Clear related caches
      await Promise.all([
        this.cacheService.invalidate(this.getCostomeCacheKey(uuid)),
        this.cacheService.invalidatePattern('costume_bases:*'),
      ]);

      return deletedCostume;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove costume base with uuid ${uuid}`,
        'costumeBase',
      );
    }
  }

  // Additional methods that might be useful

  async findByEquipmentId(equipmentId: string) {
    try {
      const cacheKey = `costume_base:equipment:${equipmentId}`;
      return this.cacheService.get(
        cacheKey,
        async () => {
          const costumeBase = await this.prisma.costumeBases.findFirst({
            where: {
              equipmentId,
              deletedAt: null,
            },
          });

          if (!costumeBase) {
            throw new NotFoundException(
              `Costume base with equipment ID ${equipmentId} not found`,
            );
          }

          return costumeBase;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find costume base with equipment ID ${equipmentId}`,
        'costumeBase',
      );
    }
  }
}
