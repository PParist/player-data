import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateTalentBaseInput } from './dto/create-talent_base.input';
import { UpdateTalentBaseInput } from './dto/update-talent_base.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { CacheLayerService } from '../cache/cache-layer.service';
import { PaginationArgs } from '../common/pagination/pagination.types';
import { PaginatedTalentBases } from './talent_bases.resolver';

@Injectable()
export class TalentBasesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getTalentCacheKey(uuid: string): string {
    return `talent_base:${uuid}`;
  }

  private getListCacheKey(options?: PaginationArgs): string {
    if (!options) return 'talent_bases:all';

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `talent_bases:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createTalentBaseInput: CreateTalentBaseInput) {
    try {
      const newTalentUuid = uuidv4();
      const talentBase = await this.prisma.talentBases.create({
        data: {
          uuid: newTalentUuid,
          ...createTalentBaseInput,
          createdAt: new Date(),
          createdBy: newTalentUuid,
          updatedAt: new Date(),
          updatedBy: newTalentUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      await this.cacheService.invalidatePattern('talent_bases:*');
      return talentBase;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create talent base',
        'talentBase',
      );
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_TALENTBASES || 'all_talents'}:all`;
      return this.cacheService.gets<PaginatedTalentBases>(
        cacheKey,
        async () => {
          const talentBases = await this.prisma.talentBases.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.talentBases.count({
            where: { deletedAt: null },
          });

          return {
            data: talentBases,
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
        'find all talent bases',
        'talentBases',
      );
    }
  }

  async findAllWithOptions(options: PaginationArgs) {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedTalentBases>(
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

          const [talentBases, totalCount] = await Promise.all([
            this.prisma.talentBases.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.talentBases.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: talentBases,
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
        'find talent bases with options',
        'talentBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getTalentCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const talentBase = await this.prisma.talentBases.findUnique({
            where: { uuid },
          });

          if (!talentBase) {
            throw new NotFoundException(
              `Talent base with uuid ${uuid} not found`,
            );
          }

          return talentBase;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find talent base with uuid ${uuid}`,
        'talentBase',
      );
    }
  }

  async update(uuid: string, updateTalentBaseInput: UpdateTalentBaseInput) {
    try {
      const updatedTalent = await this.prisma.talentBases.update({
        where: { uuid },
        data: {
          ...updateTalentBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getTalentCacheKey(uuid)),
        this.cacheService.invalidatePattern('talent_bases:*'),
      ]);

      return updatedTalent;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update talent base with uuid ${uuid}`,
        'talentBase',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedTalent = await this.prisma.talentBases.delete({
        where: { uuid },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getTalentCacheKey(uuid)),
        this.cacheService.invalidatePattern('talent_bases:*'),
      ]);

      return deletedTalent;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove talent base with uuid ${uuid}`,
        'talentBase',
      );
    }
  }
}
