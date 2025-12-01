// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../lib/prisma.service';
import { EnhancedAuthGuard } from '../auth/guards/enhanced-auth.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, EnhancedAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
