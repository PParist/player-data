import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateCostomeBaseInput } from './dto/create-costome_base.input';
import { UpdateCostomeBaseInput } from './dto/update-costome_base.input';
import { VERSION } from '@common/constants/string';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';

@Injectable()
export class CostomeBaseService {
  constructor(private prisma: PrismaService) {}

  async create(createCostomeBaseInput: CreateCostomeBaseInput) {
    try {
      const newCostomeUuid = uuidv4();
      return await this.prisma.costumeBases.create({
        data: {
          uuid: newCostomeUuid,
          ...createCostomeBaseInput,
          createdAt: new Date(),
          createdBy: newCostomeUuid,
          updatedAt: new Date(),
          updatedBy: newCostomeUuid,
          deletedAt: null,
          deletedBy: null,
          version: VERSION,
          equipmentId: createCostomeBaseInput.equimentID,
          equipType: createCostomeBaseInput.equipmentType,
        },
      });
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'create costome base',
        'costomeBase',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.costumeBases.findMany();
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'find all costome bases',
        'costomeBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const costomeBase = await this.prisma.costumeBases.findUnique({
        where: { uuid },
      });
      if (!costomeBase) {
        throw new NotFoundException(`Costome base with uuid ${uuid} not found`);
      }
      return costomeBase;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      DatabaseErrorHandler.handleError(
        error,
        `find costome base with uuid ${uuid}`,
        'costomeBase',
      );
    }
  }

  async update(uuid: string, updateCostomeBaseInput: UpdateCostomeBaseInput) {
    try {
      return await this.prisma.costumeBases.update({
        where: { uuid },
        data: {
          ...updateCostomeBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `update costome base with uuid ${uuid}`,
        'costomeBase',
      );
    }
  }

  async remove(uuid: string) {
    try {
      return await this.prisma.costumeBases.delete({
        where: { uuid },
      });
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove costome base with uuid ${uuid}`,
        'costomeBase',
      );
    }
  }
}
