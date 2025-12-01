// src/outlines/outlines.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { PermissionService } from '../auth/services/permission.service';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { UpdateOutlineDto } from './dto/update-outline.dto';
import { Status, SectionType } from '@prisma/client';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class OutlinesService {
  private readonly logger = new Logger(OutlinesService.name);

  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    memberId: string,
    memberRole: Role,
    createOutlineDto: CreateOutlineDto,
  ) {
    try {
      // Validate organization membership
      const membership = await this.prisma.organizationMember.findFirst({
        where: {
          userId,
          organizationId,
          deletedAt: null,
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'You are not a member of this organization',
        );
      }

      // Ensure the memberId from context matches the membership
      if (membership.id !== memberId) {
        throw new ForbiddenException('Invalid organization context');
      }

      // Check permissions using PermissionService
      const canCreate = this.permissionService.canCreateOutline({
        organizationId,
        memberId,
        memberRole,
      });

      if (!canCreate) {
        throw new ForbiddenException(
          'You do not have permission to create outlines in this organization',
        );
      }

      // Validate required fields
      if (!createOutlineDto.header?.trim()) {
        throw new BadRequestException('Header is required');
      }

      if (!createOutlineDto.sectionType) {
        throw new BadRequestException('Section type is required');
      }

      // Validate section type
      const validSectionTypes = Object.values(SectionType);
      if (
        !validSectionTypes.includes(createOutlineDto.sectionType as SectionType)
      ) {
        throw new BadRequestException(
          `Invalid section type. Must be one of: ${validSectionTypes.join(', ')}`,
        );
      }

      // Check duplicate header in current organization
      const existingOutline = await this.prisma.outline.findFirst({
        where: {
          header: createOutlineDto.header.trim(),
          organizationId,
          deletedAt: null,
        },
      });

      if (existingOutline) {
        throw new ConflictException(
          'An outline with this header already exists in your organization',
        );
      }

      // Validate reviewer if provided
      if (createOutlineDto.reviewerId) {
        const reviewer = await this.prisma.reviewer.findUnique({
          where: { id: createOutlineDto.reviewerId },
        });
        if (!reviewer) {
          throw new NotFoundException('Reviewer not found');
        }

        // Verify reviewer is in the same organization
        const reviewerUserId = reviewer.userId ?? undefined; // Nullish coalescing
        const reviewerMembership =
          await this.prisma.organizationMember.findFirst({
            where: {
              userId: reviewerUserId, // Now it's either string or undefined
              organizationId,
              deletedAt: null,
            },
          });

        if (!reviewerMembership) {
          throw new BadRequestException(
            'Reviewer is not a member of this organization',
          );
        }
      }

      // Create outline
      const outline = await this.prisma.outline.create({
        data: {
          header: createOutlineDto.header.trim(),
          sectionType: createOutlineDto.sectionType as SectionType,
          status: createOutlineDto.status || Status.PENDING,
          target: createOutlineDto.target || 0,
          limit: createOutlineDto.limit || 0,
          organizationId,
          createdByMemberId: memberId,
          reviewerId: createOutlineDto.reviewerId || null,
        },
        include: {
          organization: true,
          createdBy: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      this.logger.log(
        `Outline created for user ${userId} in organization ${organizationId}`,
      );

      return {
        success: true,
        data: outline,
        message: 'Outline created successfully',
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error creating outline for user ${userId}`, error);
      throw new BadRequestException(
        error.message || 'Failed to create outline',
      );
    }
  }

  async findAll(organizationId: string, page = 1, perPage = 10) {
    try {
      const skip = (page - 1) * perPage;

      const [outlines, total] = await Promise.all([
        this.prisma.outline.findMany({
          where: { organizationId, deletedAt: null },
          skip,
          take: perPage,
          include: {
            organization: true,
            createdBy: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            reviewer: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.outline.count({
          where: { organizationId, deletedAt: null },
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
            : 'No outlines found in your organization',
      };
    } catch (error) {
      this.logger.error(
        `Error fetching outlines for organization ${organizationId}`,
        error,
      );
      throw new BadRequestException(
        error.message || 'Failed to fetch outlines',
      );
    }
  }

  async findOne(organizationId: string, id: string) {
    try {
      const outline = await this.prisma.outline.findFirst({
        where: { id, organizationId, deletedAt: null },
        include: {
          organization: true,
          createdBy: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reviewer: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      if (!outline) {
        throw new NotFoundException(
          `Outline with ID "${id}" not found in your organization`,
        );
      }

      return {
        success: true,
        data: outline,
        message: 'Outline fetched successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error fetching outline ${id} from organization ${organizationId}`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(error.message || 'Failed to fetch outline');
    }
  }

  async update(
    userId: string,
    organizationId: string,
    memberId: string,
    memberRole: Role,
    id: string,
    updateOutlineDto: UpdateOutlineDto,
  ) {
    try {
      // Find outline in current organization
      const outline = await this.prisma.outline.findFirst({
        where: { id, organizationId, deletedAt: null },
        include: {
          createdBy: true,
          reviewer: true,
        },
      });

      if (!outline) {
        throw new NotFoundException(
          `Outline with ID "${id}" not found in your organization`,
        );
      }

      // Check permissions using PermissionService
      const permission = this.permissionService.canUpdateOutline(
        { organizationId, memberId, memberRole },
        outline,
        updateOutlineDto,
      );

      if (!permission.allowed) {
        throw new ForbiddenException(permission.reason);
      }

      // Check for duplicate header if header is being updated
      if (
        updateOutlineDto.header &&
        updateOutlineDto.header.trim() !== outline.header
      ) {
        const existingOutline = await this.prisma.outline.findFirst({
          where: {
            header: updateOutlineDto.header.trim(),
            organizationId,
            deletedAt: null,
            id: { not: id },
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

        // FIX: Handle null userId properly
        const reviewerMembership =
          await this.prisma.organizationMember.findFirst({
            where: {
              userId: reviewer.userId || undefined, // Convert null to undefined
              organizationId,
              deletedAt: null,
            },
          });

        if (!reviewerMembership) {
          throw new BadRequestException(
            'Reviewer is not a member of this organization',
          );
        }
      }

      // Validate section type if provided
      if (updateOutlineDto.sectionType) {
        const validSectionTypes = Object.values(SectionType);
        if (
          !validSectionTypes.includes(
            updateOutlineDto.sectionType as SectionType,
          )
        ) {
          throw new BadRequestException(
            `Invalid section type. Must be one of: ${validSectionTypes.join(', ')}`,
          );
        }
      }

      // Apply updates based on role (simplified with permission service)
      const updateData: any = { updatedAt: new Date() };

      // Add allowed fields based on permission service result
      if (permission.allowedFields) {
        Object.assign(updateData, permission.allowedFields);
      } else {
        // Fallback logic
        switch (memberRole) {
          case 'OWNER':
            Object.assign(updateData, updateOutlineDto);
            break;

          case 'REVIEWER':
            if (updateOutlineDto.status !== undefined) {
              updateData.status = updateOutlineDto.status;
            }
            break;

          case 'MEMBER':
            const { status, ...memberUpdates } = updateOutlineDto;
            Object.assign(updateData, memberUpdates);
            // Creator who is also assigned as reviewer can update status
            if (memberId === outline.reviewerId && status !== undefined) {
              updateData.status = status;
            }
            break;
        }
      }

      // Trim header if provided
      if (updateOutlineDto.header) {
        updateData.header = updateOutlineDto.header.trim();
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
          reviewer: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
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
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || 'Failed to update outline',
      );
    }
  }

  async remove(
    organizationId: string,
    memberId: string,
    memberRole: Role,
    id: string,
  ) {
    try {
      const outline = await this.prisma.outline.findFirst({
        where: { id, organizationId, deletedAt: null },
      });

      if (!outline) {
        throw new NotFoundException(
          `Outline with ID "${id}" not found in your organization`,
        );
      }

      // Check delete permissions using PermissionService
      const canDelete = this.permissionService.canDeleteOutline(
        { organizationId, memberId, memberRole },
        outline,
      );

      if (!canDelete) {
        throw new ForbiddenException(
          'You do not have permission to delete this outline. Only owners and the outline creator can delete outlines.',
        );
      }

      const deletedOutline = await this.prisma.outline.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: {
          organization: true,
          createdBy: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      this.logger.log(`Outline ${id} deleted by member ${memberId}`);

      return {
        success: true,
        data: deletedOutline,
        message: 'Outline deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting outline ${id}`, error);

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

  /**
   * Get organization statistics for the current user's organization
   */
  async getOrganizationStats(organizationId: string) {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      const [
        totalOutlines,
        completedOutlines,
        inProgressOutlines,
        pendingOutlines,
      ] = await Promise.all([
        this.prisma.outline.count({
          where: { organizationId, deletedAt: null },
        }),
        this.prisma.outline.count({
          where: { organizationId, status: Status.COMPLETED, deletedAt: null },
        }),
        this.prisma.outline.count({
          where: {
            organizationId,
            status: Status.IN_PROGRESS,
            deletedAt: null,
          },
        }),
        this.prisma.outline.count({
          where: { organizationId, status: Status.PENDING, deletedAt: null },
        }),
      ]);

      return {
        success: true,
        data: {
          organizationId,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          totalOutlines,
          completedOutlines,
          inProgressOutlines,
          pendingOutlines,
          completionRate:
            totalOutlines > 0 ? (completedOutlines / totalOutlines) * 100 : 0,
        },
        message: 'Organization statistics fetched successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error fetching stats for organization ${organizationId}`,
        error,
      );
      throw new BadRequestException(
        error.message || 'Failed to fetch organization statistics',
      );
    }
  }

  /**
   * Get outlines assigned to current user as reviewer
   */
  async getAssignedOutlines(
    organizationId: string,
    memberId: string,
    page = 1,
    perPage = 10,
  ) {
    try {
      const skip = (page - 1) * perPage;

      const [outlines, total] = await Promise.all([
        this.prisma.outline.findMany({
          where: {
            organizationId,
            reviewerId: memberId,
            deletedAt: null,
          },
          skip,
          take: perPage,
          include: {
            organization: true,
            createdBy: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            reviewer: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.outline.count({
          where: {
            organizationId,
            reviewerId: memberId,
            deletedAt: null,
          },
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
            ? 'Assigned outlines fetched successfully'
            : 'No outlines assigned to you',
      };
    } catch (error) {
      this.logger.error(
        `Error fetching assigned outlines for member ${memberId} in organization ${organizationId}`,
        error,
      );
      throw new BadRequestException(
        error.message || 'Failed to fetch assigned outlines',
      );
    }
  }

  /**
   * Get outlines created by current user
   */
  async getMyOutlines(
    organizationId: string,
    memberId: string,
    page = 1,
    perPage = 10,
  ) {
    try {
      const skip = (page - 1) * perPage;

      const [outlines, total] = await Promise.all([
        this.prisma.outline.findMany({
          where: {
            organizationId,
            createdByMemberId: memberId,
            deletedAt: null,
          },
          skip,
          take: perPage,
          include: {
            organization: true,
            createdBy: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            reviewer: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.outline.count({
          where: {
            organizationId,
            createdByMemberId: memberId,
            deletedAt: null,
          },
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
            ? 'Your outlines fetched successfully'
            : 'You have not created any outlines yet',
      };
    } catch (error) {
      this.logger.error(
        `Error fetching user outlines for member ${memberId} in organization ${organizationId}`,
        error,
      );
      throw new BadRequestException(
        error.message || 'Failed to fetch your outlines',
      );
    }
  }
}
