import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreatePlayerProfileInput } from './dto/create-player_profile.input';
import { UpdatePlayerProfileInput } from './dto/update-player_profile.input';
import { VERSION  } from '@common/constants/string';
import { CACHE_KEYS ,CACHE_TTL  } from '@common/constants/cache';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';
import { generateSuperUniquePlayerName } from 'src/common/utils/random';
import { CacheService } from '../cache/cache.service';
import { PaginationArgs } from '../common/pagination/pagination.args';
import { OptionalPaginationArgs, PaginatedPlayerProfiles } from './player_profiles.resolver';

@Injectable()
export class PlayerProfilesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

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
          version: VERSION,
        },
      });
      
      // Clear cache for findAll because new data was added
      await this.cacheService.delete('player_profiles:all');
      
      return playerProfile;
    } catch (error) {
      DatabaseErrorHandler.handleError(error, 'create player profile', 'playerProfile');
    }
  }

  async findAll() {
    try {
      // Try to fetch data from cache first
      const cacheKey = `${CACHE_KEYS.ALL_PROFILES}:all`;
      const cachedProfiles = await this.cacheService.get<any[]>(cacheKey);
      
      // If data exists in cache, return it immediately
      if (cachedProfiles) {
        console.log('Returning player profiles from cache',cachedProfiles);
        return cachedProfiles;
      }
      
      // If not in cache, fetch from database with pagination and selected fields
      const profiles = await this.prisma.playerProfiles.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
      });
      
      // Get total count for pagination metadata
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
        }
      };
      
      // Store data in cache
      await this.cacheService.set(cacheKey, result, CACHE_TTL.ALL_PROFILES);
      console.log('Returning player profiles from database',profiles);
      return result;
    } catch (error) {
      DatabaseErrorHandler.handleError(error, 'find all player profiles', 'playerProfiles');
    }
  }

   async findAllWithOptions(options: OptionalPaginationArgs): Promise<PaginatedPlayerProfiles> {
    try {
      const { page = 1, limit = 100, orderBy = 'updatedAt', orderDirection = 'desc' } = options;
      
      const cacheKey = `${CACHE_KEYS.ALL_PROFILES}:${page}:${limit}:${orderBy}:${orderDirection}`;
      const cachedResult = await this.cacheService.get<PaginatedPlayerProfiles>(cacheKey);
      
      if (cachedResult) {
        console.log(`Returning player profiles with options from cache: ${cacheKey}`);
        return cachedResult;
      }
      
      const skip = (page - 1) * limit;
      const orderOption = {};
      orderOption[orderBy] = orderDirection;
      
      const profiles = await this.prisma.playerProfiles.findMany({
        skip,
        take: limit,
        //select: this.selectFields,
        orderBy: orderOption,
        where: { deletedAt: null },
      });
      
      const totalCount = await this.prisma.playerProfiles.count({
        where: { deletedAt: null },
      });
      
      const result = {
        data: profiles,
        meta: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      };
      
      await this.cacheService.set(cacheKey, result, CACHE_TTL.ALL_PROFILES);
      return result;

    } catch (error) {
      console.error('Error in findAllWithOptions:', error);
      DatabaseErrorHandler.handleError(error, 'find player profiles with options', 'playerProfiles');
    }
  }


  async findAllConnection(args: PaginationArgs) {
    try {
      const cacheKey = `${CACHE_KEYS.ALL_PROFILES}:connection:${JSON.stringify(args)}`;
      const cachedResult = await this.cacheService.get(cacheKey);
      
      if (cachedResult) {
        console.log('Returning player profiles connection from cache');
        return cachedResult;
      }
      
      // ประมวลผลพารามิเตอร์การแบ่งหน้า
      let { first, last, before, after, skip = 0 } = args;
      
      // กำหนดค่าเริ่มต้น
      if (!first && !last) {
        first = 10;
      }
      
      // สร้างเงื่อนไขการค้นหา
      const where = { deletedAt: null };
      let take = first || last || 10;
      
      // ตรวจสอบและประมวลผล after cursor
      if (after) {
        const decodedCursor = Buffer.from(after, 'base64').toString('utf8');
        const cursorUuid = decodedCursor.replace('cursor:', '');
        
        const cursorItem = await this.prisma.playerProfiles.findUnique({
          where: { uuid: cursorUuid },
        });
        
        if (cursorItem) {
          where['updatedAt'] = {
            lt: cursorItem.updatedAt,
          };
        }
      }
      
      // ตรวจสอบและประมวลผล before cursor
      if (before) {
        const decodedCursor = Buffer.from(before, 'base64').toString('utf8');
        const cursorUuid = decodedCursor.replace('cursor:', '');
        
        const cursorItem = await this.prisma.playerProfiles.findUnique({
          where: { uuid: cursorUuid },
        });
        
        if (cursorItem) {
          where['updatedAt'] = {
            gt: cursorItem.updatedAt,
          };
        }
      }
      
      // ถ้าใช้ last ให้ดึงข้อมูลย้อนกลับ
      if (last) {
        take = -last;
      }
      
      // ดึงข้อมูลจากฐานข้อมูล
      const items = await this.prisma.playerProfiles.findMany({
        take,
        skip,
        where,
        orderBy: { updatedAt: 'desc' },
        //select: this.selectFields,
      });
      
      // นับจำนวนทั้งหมด
      const totalCount = await this.prisma.playerProfiles.count({
        where: { deletedAt: null },
      });
      
      // สร้าง edges
      const edges = items.map((item) => ({
        cursor: Buffer.from(`cursor:${item.uuid}`).toString('base64'),
        node: item,
      }));
      
      // สร้าง pageInfo
      const startCursor = edges.length > 0 ? edges[0].cursor : null;
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
      
      let hasNextPage = false;
      let hasPreviousPage = false;
      
      if (first) {
        hasNextPage = items.length === first;
        
        if (hasNextPage) {
          // ตรวจสอบว่ามีรายการถัดไปหรือไม่
          const nextItem = await this.prisma.playerProfiles.findFirst({
            where: {
              deletedAt: null,
              ...(items.length > 0 ? {
                updatedAt: {
                  lt: items[items.length - 1].updatedAt,
                },
              } : {}),
            },
            orderBy: { updatedAt: 'desc' },
          });
          
          hasNextPage = !!nextItem;
        }
      }
      
      if (last) {
        hasPreviousPage = items.length === last;
        
        if (hasPreviousPage) {
          // ตรวจสอบว่ามีรายการก่อนหน้าหรือไม่
          const prevItem = await this.prisma.playerProfiles.findFirst({
            where: {
              deletedAt: null,
              ...(items.length > 0 ? {
                updatedAt: {
                  gt: items[0].updatedAt,
                },
              } : {}),
            },
            orderBy: { updatedAt: 'asc' },
          });
          
          hasPreviousPage = !!prevItem;
        }
      }
      
      // สร้างผลลัพธ์
      const result = {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
        totalCount,
      };
      
      // เก็บผลลัพธ์ในแคช
      await this.cacheService.set(cacheKey, result, CACHE_TTL.ALL_PROFILES);
      
      return result;
    } catch (error) {
      DatabaseErrorHandler.handleError(error, 'find player profiles connection', 'playerProfiles');
    }
  }

  async findOne(uuid: string) {
    try {
      // Create cache key for player profile
      const cacheKey = `player_profile:${uuid}`;
      
      // Try to fetch data from cache first
      const cachedProfile = await this.cacheService.get(cacheKey);
      
      // If data exists in cache, return it immediately
      if (cachedProfile) {
        console.log(`Returning player profile ${uuid} from cache`);
        return cachedProfile;
      }
      
      // If not in cache, fetch from database
      const playerProfile = await this.prisma.playerProfiles.findUnique({
        where: { uuid },
      });
      
      if (!playerProfile) {
        throw new NotFoundException(`Player profile with uuid ${uuid} not found`);
      }
      
      // Store data in cache (TTL 10 minutes)
      await this.cacheService.set(cacheKey, playerProfile, 600);
      
      return playerProfile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(error, `find player profile with uuid ${uuid}`, 'playerProfile');
    }
  }

  async update(uuid: string, updatePlayerProfileInput: UpdatePlayerProfileInput) {
    try {
      const updatedProfile = await this.prisma.playerProfiles.update({
        where: { uuid },
        data: {
          ...updatePlayerProfileInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });
      
      // Update cache for this profile
      const cacheKey = `player_profile:${uuid}`;
      await this.cacheService.set(cacheKey, updatedProfile, 600);
      
      // Clear cache for findAll because data was updated
      await this.cacheService.delete('player_profiles:all');
      
      return updatedProfile;
    } catch (error) {
      DatabaseErrorHandler.handleError(error, `update player profile with uuid ${uuid}`, 'playerProfile');
    }
  }

  async remove(uuid: string) {
    try {
      const deletedProfile = await this.prisma.playerProfiles.delete({
        where: { uuid },
      });
      
      // Delete cache for this profile
      await this.cacheService.delete(`player_profile:${uuid}`);
      
      // Clear cache for findAll because data was deleted
      await this.cacheService.delete('player_profiles:all');
      
      return deletedProfile;
    } catch (error) {
      DatabaseErrorHandler.handleError(error, `remove player profile with uuid ${uuid}`, 'playerProfile');
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