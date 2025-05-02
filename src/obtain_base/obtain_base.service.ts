import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { CreateObtainBaseInput } from './dto/create-obtain_base.input';
import { UpdateObtainBaseInput } from './dto/update-obtain_base.input';
import { VERSION } from '@common/constants/string';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseErrorHandler } from 'src/common/errors/prisma.error';

@Injectable()
export class ObtainBaseService {
  constructor(private prisma: PrismaService) {}

  async create(createObtainBaseInput: CreateObtainBaseInput) {
    try {
      const newObtainUuid = uuidv4();
      return await this.prisma.obtainBases.create({
        data: {
          uuid: newObtainUuid,
          ...createObtainBaseInput,
          createdAt: new Date(),
          createdBy: newObtainUuid,
          updatedAt: new Date(),
          updatedBy: newObtainUuid,
          deletedAt: null,
          deletedBy: null,
          version: VERSION,
        },
      });
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
      return await this.prisma.obtainBases.findMany();
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        'find all obtain bases',
        'obtainBases',
      );
    }
  }

  async findOne(uuid: string) {
    try {
      const obtainBase = await this.prisma.obtainBases.findUnique({
        where: { uuid },
      });
      if (!obtainBase) {
        throw new NotFoundException(`Obtain base with uuid ${uuid} not found`);
      }
      return obtainBase;
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
      return await this.prisma.obtainBases.update({
        where: { uuid },
        data: {
          ...updateObtainBaseInput,
          updatedAt: new Date(),
          updatedBy: uuid,
        },
      });
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
      return await this.prisma.obtainBases.delete({
        where: { uuid },
      });
    } catch (error) {
      DatabaseErrorHandler.handleError(
        error,
        `remove obtain base with uuid ${uuid}`,
        'obtainBase',
      );
    }
  }
}
