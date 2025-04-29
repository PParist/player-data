import { PrismaService } from 'nestjs-prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { RegisterInput } from './dto/register.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}
}
