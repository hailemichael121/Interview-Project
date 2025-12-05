import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../lib/prisma.service';
import { PermissionService } from '../auth/services/permission.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, PrismaService, PermissionService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
