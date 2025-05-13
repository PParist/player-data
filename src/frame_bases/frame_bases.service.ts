import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateFrameBaseInput } from './dto/create-frame_base.input';
import { UpdateFrameBaseInput } from './dto/update-frame_base.input';
import { CACHE_KEYS, CACHE_TTL } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { CacheLayerService } from '../cache/cache-layer.service';
import {
  OptionalPaginationArgs,
  PaginatedFrameBases,
} from './frame_bases.resolver';

@Injectable()
export class FrameBasesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheLayerService,
  ) {}

  private getFrameCacheKey(uuid: string): string {
    return `frame_base:${uuid}`;
  }

  private getListCacheKey(options?: OptionalPaginationArgs): string {
    if (!options) return 'frame_bases:all';

    const {
      page = 1,
      limit = 100,
      orderBy = 'updatedAt',
      orderDirection = 'desc',
    } = options;
    return `frame_bases:${page}:${limit}:${orderBy}:${orderDirection}`;
  }

  async create(createFrameBaseInput: CreateFrameBaseInput) {
    try {
      const newFrameUuid = uuidv4();
      const frameBase = await this.prisma.frameBases.create({
        data: {
          uuid: newFrameUuid,
          ...createFrameBaseInput,
          createdAt: new Date(),
          createdBy: newFrameUuid,
          updatedAt: new Date(),
          updatedBy: newFrameUuid,
          deletedAt: null,
          deletedBy: null,
          version: 1,
        },
      });

      await this.cacheService.invalidatePattern('frame_bases:*');
      return frameBase;
    } catch (error) {
      DatabaseErrorHandler.handleError(error, 'create frame base', 'frameBase');
    }
  }

  async findAll() {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_FRAMEBASES || 'all_frames'}:all`;
      return this.cacheService.gets<PaginatedFrameBases>(
        cacheKey,
        async () => {
          const frameBases = await this.prisma.frameBases.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
          });

          const totalCount = await this.prisma.frameBases.count({
            where: { deletedAt: null },
          });
          return {
            data: frameBases,
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
        'find all frame bases',
        'frameBases',
      );
    }
  }

  async findAllWithOptions(options: OptionalPaginationArgs) {
    try {
      const cacheKey = this.getListCacheKey(options);
      return this.cacheService.gets<PaginatedFrameBases>(
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

          const [frameBases, totalCount] = await Promise.all([
            this.prisma.frameBases.findMany({
              skip,
              take: limit,
              orderBy: orderOption,
              where: { deletedAt: null },
            }),
            this.prisma.frameBases.count({
              where: { deletedAt: null },
            }),
          ]);

          return {
            data: frameBases,
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
        'find frame bases with options',
        'frameBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const cacheKey = this.getFrameCacheKey(uuid);
      return this.cacheService.get(
        cacheKey,
        async () => {
          const frameBase = await this.prisma.frameBases.findUnique({
            where: { uuid },
          });

          if (!frameBase) {
            throw new NotFoundException(
              `Frame base with uuid ${uuid} not found`,
            );
          }

          return frameBase;
        },
        CACHE_TTL.LOCAL_FINDONE,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find frame base with uuid ${uuid}`,
        'frameBase',
      );
    }
  }

  async update(uuid: string, updateFrameBaseInput: UpdateFrameBaseInput) {
    try {
      const updatedFrame = await this.prisma.frameBases.update({
        where: { uuid },
        data: {
          ...updateFrameBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getFrameCacheKey(uuid)),
        this.cacheService.invalidatePattern('frame_bases:*'),
      ]);

      return updatedFrame;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update frame base with uuid ${uuid}`,
        'frameBase',
      );
    }
  }

  async remove(uuid: string) {
    try {
      const deletedFrame = await this.prisma.frameBases.delete({
        where: { uuid },
      });

      await Promise.all([
        this.cacheService.invalidate(this.getFrameCacheKey(uuid)),
        this.cacheService.invalidatePattern('frame_bases:*'),
      ]);

      return deletedFrame;
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove frame base with uuid ${uuid}`,
        'frameBase',
      );
    }
  }
}
