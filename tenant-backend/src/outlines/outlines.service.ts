import { Injectable, ForbiddenException } from '@nestjs/common';
import { prisma } from '../lib/prisma';

@Injectable()
export class OutlinesService {
  async findAllByOrganization(organizationId: string) {
    return prisma.outline.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    return prisma.outline.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.outline.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.outline.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.outline.delete({ where: { id } });
  }
}
