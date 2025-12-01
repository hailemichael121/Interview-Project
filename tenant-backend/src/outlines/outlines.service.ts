/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { UpdateOutlineDto } from './dto/update-outline.dto';
import { Status, SectionType } from '@prisma/client';

@Injectable()
export class OutlinesService {
  private readonly logger = new Logger(OutlinesService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOutlineDto: CreateOutlineDto) {
    try {
      const organization = await this.getOrCreateUserOrganization(userId);
      const member = await this.getOrCreateOrganizationMember(
        userId,
        organization.id,
      );

      // Check for duplicate outline header in the same organization
      const existingOutline = await this.prisma.outline.findFirst({
        where: {
          header: createOutlineDto.header,
          organizationId: organization.id,
          deletedAt: null,
        },
      });

      if (existingOutline) {
        throw new ConflictException(
          'An outline with this header already exists in your organization',
        );
      }

      // Validate reviewer exists if provided
      if (createOutlineDto.reviewerId) {
        const reviewer = await this.prisma.reviewer.findUnique({
          where: { id: createOutlineDto.reviewerId },
        });
        if (!reviewer) {
          throw new NotFoundException('Reviewer not found');
        }
      }

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
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: true,
        },
      });

      this.logger.log(
        `Outline created with ID: ${outline.id} by user ${userId}`,
      );

      return {
        success: true,
        data: outline,
        message: 'Outline created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating outline for user ${userId}`, error);

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Failed to create outline',
      );
    }
  }

  async findAll(userId: string, page = 1, perPage = 10) {
    try {
      const member = await this.prisma.organizationMember.findFirst({
        where: { userId, deletedAt: null },
        include: { organization: true },
      });

      if (!member) {
        return {
          success: true,
          data: [],
          page,
          perPage,
          total: 0,
          message: 'No outlines found',
        };
      }

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

      return {
        success: true,
        data: outlines,
        page,
        perPage,
        total,
        message:
          outlines.length > 0
            ? 'Outlines fetched successfully'
            : 'No outlines found',
      };
    } catch (error) {
      this.logger.error(`Error fetching outlines for user ${userId}`, error);
      throw new BadRequestException(
        error.message || 'Failed to fetch outlines',
      );
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const member = await this.prisma.organizationMember.findFirst({
        where: { userId, deletedAt: null },
      });

      if (!member) {
        throw new NotFoundException('Organization membership not found');
      }

      const outline = await this.prisma.outline.findFirst({
        where: { id, organizationId: member.organizationId, deletedAt: null },
        include: {
          organization: true,
          createdBy: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: true,
        },
      });

      if (!outline) {
        throw new NotFoundException(
          `Outline with ID "${id}" not found or you don't have access to it`,
        );
      }

      return {
        success: true,
        data: outline,
        message: 'Outline fetched successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error fetching outline ${id} for user ${userId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(error.message || 'Failed to fetch outline');
    }
  }

  async update(userId: string, id: string, updateOutlineDto: UpdateOutlineDto) {
    try {
      const member = await this.prisma.organizationMember.findFirst({
        where: { userId, deletedAt: null },
      });

      if (!member) {
        throw new NotFoundException('Organization membership not found');
      }

      const outline = await this.prisma.outline.findFirst({
        where: { id, organizationId: member.organizationId, deletedAt: null },
        include: { createdBy: true },
      });

      if (!outline) {
        throw new NotFoundException(
          `Outline with ID "${id}" not found or you don't have access to it`,
        );
      }

      // Check for duplicate header if header is being updated
      if (
        updateOutlineDto.header &&
        updateOutlineDto.header !== outline.header
      ) {
        const existingOutline = await this.prisma.outline.findFirst({
          where: {
            header: updateOutlineDto.header,
            organizationId: member.organizationId,
            deletedAt: null,
            id: { not: id }, // Exclude current outline
          },
        });

        if (existingOutline) {
          throw new ConflictException(
            'An outline with this header already exists in your organization',
          );
        }
      }

      // Validate reviewer exists if provided
      if (updateOutlineDto.reviewerId) {
        const reviewer = await this.prisma.reviewer.findUnique({
          where: { id: updateOutlineDto.reviewerId },
        });
        if (!reviewer) {
          throw new NotFoundException('Reviewer not found');
        }
      }

      // RBAC rules
      const isOwner = member.role === 'OWNER';
      const isReviewer = member.id === outline.reviewerId;
      const isCreator = member.id === outline.createdByMemberId;

      const updateData: any = { updatedAt: new Date() };

      if (isOwner) {
        Object.assign(updateData, updateOutlineDto); // Owner can update all fields
      } else if (isReviewer) {
        // Reviewer can only update status
        if (updateOutlineDto.status !== undefined) {
          updateData.status = updateOutlineDto.status;
        } else {
          throw new ForbiddenException(
            'Reviewers can only update the status field',
          );
        }
      } else if (isCreator) {
        // Creator can update all fields except status (unless they're also a reviewer)
        const { status, ...rest } = updateOutlineDto;
        Object.assign(updateData, rest);

        // Creator who is also assigned as reviewer can update status
        if (
          isCreator &&
          outline.reviewerId === member.id &&
          status !== undefined
        ) {
          updateData.status = status;
        }
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
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: true,
        },
      });

      this.logger.log(`Outline ${id} updated by user ${userId}`);

      return {
        success: true,
        data: updatedOutline,
        message: 'Outline updated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error updating outline ${id} for user ${userId}`,
        error,
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Failed to update outline',
      );
    }
  }

  async remove(userId: string, id: string) {
    try {
      const member = await this.prisma.organizationMember.findFirst({
        where: { userId, deletedAt: null },
      });

      if (!member) {
        throw new NotFoundException('Organization membership not found');
      }

      const outline = await this.prisma.outline.findFirst({
        where: { id, organizationId: member.organizationId, deletedAt: null },
      });

      if (!outline) {
        throw new NotFoundException(
          `Outline with ID "${id}" not found or you don't have access to it`,
        );
      }

      // Only owner or creator can soft-delete
      if (member.role !== 'OWNER' && member.id !== outline.createdByMemberId) {
        throw new ForbiddenException(
          'You do not have permission to delete this outline. Only owners and the outline creator can delete outlines.',
        );
      }

      const deletedOutline = await this.prisma.outline.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Outline ${id} deleted by user ${userId}`);

      return {
        success: true,
        data: deletedOutline,
        message: 'Outline deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting outline ${id} for user ${userId}`,
        error,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Failed to delete outline',
      );
    }
  }

  private async getOrCreateUserOrganization(userId: string) {
    try {
      const existingMember = await this.prisma.organizationMember.findFirst({
        where: { userId, deletedAt: null },
        include: { organization: true },
      });

      if (existingMember) return existingMember.organization;

      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      // Generate unique slug
      const baseSlug = `org-${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}-${userId.slice(-6)}`;
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await this.prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return await this.prisma.organization.create({
        data: {
          name: `${user?.name || 'User'}'s Organization`,
          slug: slug,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error getting/creating organization for user ${userId}`,
        error,
      );
      throw new BadRequestException('Failed to create organization for user');
    }
  }

  private async getOrCreateOrganizationMember(
    userId: string,
    organizationId: string,
  ) {
    try {
      const existingMember = await this.prisma.organizationMember.findFirst({
        where: { userId, organizationId, deletedAt: null },
      });

      if (existingMember) return existingMember;

      return await this.prisma.organizationMember.create({
        data: { userId, organizationId, role: 'OWNER' },
      });
    } catch (error) {
      this.logger.error(
        `Error getting/creating member for user ${userId} in org ${organizationId}`,
        error,
      );
      throw new BadRequestException('Failed to create organization member');
    }
  }
}
