/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { UpdateOutlineDto } from './dto/update-outline.dto';
import { Status } from '@prisma/client';

@Injectable()
export class OutlinesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOutlineDto: CreateOutlineDto) {
    const organization = await this.getOrCreateUserOrganization(userId);
    const member = await this.getOrCreateOrganizationMember(
      userId,
      organization.id,
    );

    const outline = await this.prisma.outline.create({
      data: {
        header: createOutlineDto.header,
        sectionType: createOutlineDto.sectionType,
        status: createOutlineDto.status || Status.PENDING,
        target: createOutlineDto.target || 0,
        limit: createOutlineDto.limit || 0,
        organizationId: organization.id,
        createdByMemberId: member.id,
        reviewerId: createOutlineDto.reviewerId || null,
      },
      include: {
        organization: true,
        createdBy: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        reviewer: true,
      },
    });

    return {
      success: true,
      data: outline,
      message: 'Outline created successfully',
    };
  }

  async findAll(userId: string, page = 1, perPage = 10) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId, deletedAt: null },
      include: { organization: true },
    });
    if (!member) return { success: true, data: [], page, perPage, total: 0 };

    const skip = (page - 1) * perPage;

    const [outlines, total] = await Promise.all([
      this.prisma.outline.findMany({
        where: { organizationId: member.organizationId, deletedAt: null },
        skip,
        take: perPage,
        include: {
          organization: true,
          createdBy: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.outline.count({
        where: { organizationId: member.organizationId, deletedAt: null },
      }),
    ]);

    return { success: true, data: outlines, page, perPage, total };
  }

  async findOne(userId: string, id: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!member) throw new NotFoundException('Organization member not found');

    const outline = await this.prisma.outline.findFirst({
      where: { id, organizationId: member.organizationId, deletedAt: null },
      include: {
        organization: true,
        createdBy: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        reviewer: true,
      },
    });

    if (!outline)
      throw new NotFoundException(`Outline with ID ${id} not found`);
    return { success: true, data: outline };
  }

  async update(userId: string, id: string, updateOutlineDto: UpdateOutlineDto) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!member) throw new NotFoundException('Organization member not found');

    const outline = await this.prisma.outline.findFirst({
      where: { id, organizationId: member.organizationId, deletedAt: null },
      include: { createdBy: true },
    });
    if (!outline)
      throw new NotFoundException(`Outline with ID ${id} not found`);

    // RBAC rules
    const isOwner = member.role === 'OWNER';
    const isReviewer = member.id === outline.reviewerId;
    const isCreator = member.id === outline.createdByMemberId;

    const updateData: any = { updatedAt: new Date() };

    if (isOwner) {
      Object.assign(updateData, updateOutlineDto); // Owner can update all fields
    } else if (isReviewer) {
      // Reviewer can only update status
      if (updateOutlineDto.status) updateData.status = updateOutlineDto.status;
      else throw new ForbiddenException('Reviewer can only update status');
    } else if (isCreator) {
      // Creator can update all fields except status
      const { status, ...rest } = updateOutlineDto;
      Object.assign(updateData, rest);
    } else {
      throw new ForbiddenException(
        'You do not have permission to update this outline',
      );
    }

    const updatedOutline = await this.prisma.outline.update({
      where: { id },
      data: updateData,
      include: {
        organization: true,
        createdBy: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        reviewer: true,
      },
    });

    return {
      success: true,
      data: updatedOutline,
      message: 'Outline updated successfully',
    };
  }

  async remove(userId: string, id: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!member) throw new NotFoundException('Organization member not found');

    const outline = await this.prisma.outline.findFirst({
      where: { id, organizationId: member.organizationId, deletedAt: null },
    });
    if (!outline)
      throw new NotFoundException(`Outline with ID ${id} not found`);

    // Only owner or creator can soft-delete
    if (member.role !== 'OWNER' && member.id !== outline.createdByMemberId) {
      throw new ForbiddenException(
        'You do not have permission to delete this outline',
      );
    }

    const deletedOutline = await this.prisma.outline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      data: deletedOutline,
      message: 'Outline deleted successfully',
    };
  }

  private async getOrCreateUserOrganization(userId: string) {
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: { userId, deletedAt: null },
      include: { organization: true },
    });
    if (existingMember) return existingMember.organization;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return await this.prisma.organization.create({
      data: {
        name: `${user?.name || 'User'}'s Organization`,
        slug: `org-${userId}-${Date.now()}`,
      },
    });
  }

  private async getOrCreateOrganizationMember(
    userId: string,
    organizationId: string,
  ) {
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: { userId, organizationId, deletedAt: null },
    });
    if (existingMember) return existingMember;

    return await this.prisma.organizationMember.create({
      data: { userId, organizationId, role: 'OWNER' },
    });
  }
}
