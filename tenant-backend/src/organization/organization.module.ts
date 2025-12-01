import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../lib/prisma.service';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, PrismaService],
})
export class OrganizationModule {}
