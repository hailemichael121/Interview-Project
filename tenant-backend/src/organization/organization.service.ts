/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/organization/organization.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PermissionService } from '../auth/services/permission.service';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  // --------------------------
  // Create organization
  // --------------------------
  async createOrganization(dto: CreateOrganizationDto, ownerId: string) {
    try {
      this.logger.log(`Creating organization "${dto.name}" by user ${ownerId}`);

      // Generate a unique slug if not provided
      let finalSlug = dto.slug;
      if (!finalSlug) {
        finalSlug = this.generateSlug(dto.name);
      }

      // Check for existing organization with the same slug
      const existingOrg = await this.prisma.organization.findUnique({
        where: { slug: finalSlug },
      });

      if (existingOrg) {
        throw new ConflictException(
          'Organization with this slug already exists. Please choose a different slug.',
        );
      }

      const org = await this.prisma.organization.create({
        data: {
          name: dto.name,
          slug: finalSlug,
          members: {
            create: {
              userId: ownerId,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Organization created with id ${org.id}`);

      return {
        success: true,
        message: 'Organization created successfully',
        data: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          createdAt: org.createdAt,
          members: org.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            user: m.user,
          })),
        },
      };
    } catch (error: any) {
      this.logger.error('Error creating organization', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      // Check if it's a Prisma error
      if (error.code && error.code === 'P2002') {
        const constraint =
          (error.meta as any)?.target ||
          (error.meta as any)?.constraint?.fields;
        if (
          constraint &&
          Array.isArray(constraint) &&
          constraint.includes('slug')
        ) {
          throw new ConflictException(
            'Organization with this slug already exists. Please choose a different slug.',
          );
        }
      }

      throw new BadRequestException(
        'Failed to create organization. Please try again with a different name or slug.',
      );
    }
  }

  // --------------------------
  // List organizations for a user (using pre-fetched memberships)
  // --------------------------
  // In listUserOrganizations method, add proper typing:
  async listUserOrganizations(
    userId: string,
    memberships: any[],
    page = 1,
    perPage = 10,
  ) {
    try {
      // Use pagination on the pre-fetched memberships
      const skip = (page - 1) * perPage;
      const paginatedMemberships = memberships.slice(skip, skip + perPage);

      // Fetch complete organization details for paginated memberships
      const organizations = await Promise.all(
        paginatedMemberships.map(async (membership: any) => {
          const org = await this.prisma.organization.findUnique({
            where: { id: membership.organizationId },
            select: {
              id: true,
              name: true,
              slug: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  members: {
                    where: { deletedAt: null },
                  },
                  outlines: {
                    where: { deletedAt: null },
                  },
                },
              },
            },
          });

          return {
            ...org,
            role: membership.role as Role,
            joinedAt: membership.joinedAt as Date,
            memberId: membership.id as string,
          };
        }),
      );

      return {
        success: true,
        message: 'Organizations fetched successfully',
        data: organizations,
        page,
        perPage,
        total: memberships.length,
      };
    } catch (error) {
      this.logger.error(
        `Error listing organizations for user ${userId}`,
        error,
      );
      throw new BadRequestException(
        'Failed to list organizations. Please try again.',
      );
    }
  }
  // --------------------------
  // Get organization details
  // --------------------------
  async getOrganizationDetails(organizationId: string) {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          members: {
            where: { deletedAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              outlines: {
                where: { deletedAt: null },
              },
              members: {
                where: { deletedAt: null },
              },
            },
          },
        },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      return {
        success: true,
        message: 'Organization details fetched successfully',
        data: organization,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching organization details ${organizationId}`,
        error,
      );
      throw new BadRequestException(
        'Failed to fetch organization details. Please try again.',
      );
    }
  }

  // --------------------------
  // Update organization
  // --------------------------
  async updateOrganization(
    orgId: string,
    dto: UpdateOrganizationDto,
    userId: string,
    userRole: string,
  ) {
    try {
      // Verify user is OWNER of this organization
      if (userRole !== 'OWNER') {
        throw new ForbiddenException(
          'Only organization owners can update organization details',
        );
      }

      // Check for duplicate slug if slug is being updated
      if (dto.slug) {
        const existingOrg = await this.prisma.organization.findFirst({
          where: {
            slug: dto.slug,
            id: { not: orgId },
          },
        });

        if (existingOrg) {
          throw new ConflictException(
            'Organization with this slug already exists. Please choose a different slug.',
          );
        }
      }

      const org = await this.prisma.organization.update({
        where: { id: orgId },
        data: dto,
      });

      return {
        success: true,
        message: 'Organization updated successfully',
        data: org,
      };
    } catch (error) {
      this.logger.error(`Error updating organization ${orgId}`, error);

      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      if (error.code === 'P2002') {
        const constraint = error.meta?.target || error.meta?.constraint?.fields;
        if (constraint && constraint.includes('slug')) {
          throw new ConflictException(
            'Organization with this slug already exists. Please choose a different slug.',
          );
        }
      }

      throw new BadRequestException(
        'Failed to update organization. Please try again.',
      );
    }
  }

  // --------------------------
  // Invite member
  // --------------------------
  async inviteMember(
    orgId: string,
    email: string,
    role: 'MEMBER' | 'OWNER',
    inviterUserId: string,
    inviterMemberId: string,
  ) {
    try {
      // NORMALIZE EMAIL TO LOWERCASE
      const normalizedEmail = email.toLowerCase();

      // Get organization for invitation details
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Check if user is already a member (use normalized email)
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail }, // Use normalized email
      });

      if (existingUser) {
        const existingMember = await this.prisma.organizationMember.findFirst({
          where: {
            organizationId: orgId,
            userId: existingUser.id,
            deletedAt: null,
          },
        });
        if (existingMember) {
          throw new ConflictException(
            'User is already a member of this organization',
          );
        }
      }

      // Check for existing pending invite (use normalized email)
      const existingInvite = await this.prisma.organizationInvite.findFirst({
        where: {
          organizationId: orgId,
          email: normalizedEmail, // Use normalized email
          deletedAt: null,
          expires: { gt: new Date() },
        },
      });
      if (existingInvite) {
        throw new ConflictException(
          'An active invitation already exists for this email',
        );
      }
      const token =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invite = await this.prisma.organizationInvite.create({
        data: {
          organizationId: orgId,
          email,
          role,
          token,
          expires,
          invitedById: inviterMemberId,
        },
      });

      await this.prisma.invitationLog.create({
        data: {
          inviteToken: token,
          invitedEmail: email,
          organizationId: orgId,
          organizationSlug: organization.slug,
          organizationName: organization.name,
          inviterMemberId: inviterMemberId,
        },
      });

      return {
        success: true,
        message: `Invitation sent to ${email}`,
        data: {
          ...invite,
          organizationSlug: organization.slug,
          organizationName: organization.name,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error inviting member ${email} to org ${orgId}`,
        error,
      );

      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to invite member. Please try again.',
      );
    }
  }

  // --------------------------
  // Accept invitation
  // --------------------------
  async acceptInvitation(token: string, userId: string, userEmail: string) {
    try {
      const invite = await this.prisma.organizationInvite.findFirst({
        where: { token, deletedAt: null, expires: { gt: new Date() } },
        include: {
          organization: true,
          logs: {
            where: { status: 'PENDING' },
            take: 1,
          },
        },
      });

      if (!invite) {
        throw new NotFoundException('Invalid or expired invitation');
      }

      // Verify invitation email matches user email
      if (userEmail !== invite.email) {
        throw new ForbiddenException(
          'This invitation was sent to a different email address',
        );
      }

      // Check if user is already a member
      const existingMember = await this.prisma.organizationMember.findFirst({
        where: {
          organizationId: invite.organizationId,
          userId,
          deletedAt: null,
        },
      });

      if (existingMember) {
        throw new ConflictException(
          'You are already a member of this organization',
        );
      }

      // Create membership
      const member = await this.prisma.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId,
          role: invite.role as Role,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Update invitation log
      if (invite.logs.length > 0) {
        await this.prisma.invitationLog.update({
          where: { id: invite.logs[0].id },
          data: {
            status: 'ACCEPTED',
            acceptedByUserId: userId,
            acceptedByMemberId: member.id,
          },
        });
      }

      // Mark invitation as used
      await this.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
        message: 'Invitation accepted successfully',
        data: {
          organization: {
            id: member.organization.id,
            name: member.organization.name,
            slug: member.organization.slug,
          },
          member: {
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt,
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Error accepting invitation with token ${token}`,
        error,
      );

      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to accept invitation. Please try again.',
      );
    }
  }

  // --------------------------
  // List members (paginated)
  // --------------------------
  async listMembers(orgId: string, page = 1, perPage = 10) {
    try {
      const skip = (page - 1) * perPage;
      const [members, total] = await Promise.all([
        this.prisma.organizationMember.findMany({
          where: {
            organizationId: orgId,
            deletedAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
              },
            },
          },
          skip,
          take: perPage,
          orderBy: { joinedAt: 'asc' },
        }),
        this.prisma.organizationMember.count({
          where: { organizationId: orgId, deletedAt: null },
        }),
      ]);

      return {
        success: true,
        message: 'Members fetched successfully',
        data: members.map((member) => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: member.user,
        })),
        page,
        perPage,
        total,
      };
    } catch (error) {
      this.logger.error(`Error listing members for org ${orgId}`, error);
      throw new BadRequestException(
        'Failed to list members. Please try again.',
      );
    }
  }

  // --------------------------
  // Revoke member
  // --------------------------
  async revokeMember(
    orgId: string,
    targetMemberId: string,
    ownerId: string,
    ownerRole: string,
  ) {
    try {
      // Verify owner role
      if (ownerRole !== 'OWNER') {
        throw new ForbiddenException(
          'Only organization owners can revoke member access',
        );
      }

      const targetMember = await this.prisma.organizationMember.findUnique({
        where: { id: targetMemberId },
        include: {
          organization: true,
          user: true,
        },
      });

      if (!targetMember) {
        throw new NotFoundException('Member not found');
      }

      // Verify target member belongs to the same organization
      if (targetMember.organizationId !== orgId) {
        throw new BadRequestException(
          'Member does not belong to this organization',
        );
      }

      // Prevent owners from revoking themselves
      if (targetMember.userId === ownerId) {
        throw new ForbiddenException('Cannot revoke your own access as owner');
      }

      // Prevent revoking other owners
      if (targetMember.role === 'OWNER') {
        throw new ForbiddenException('Cannot revoke another owner');
      }

      await this.prisma.organizationMember.update({
        where: { id: targetMemberId },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
        message: `Member ${targetMember.user.email} access revoked successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error revoking member ${targetMemberId} from org ${orgId}`,
        error,
      );

      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to revoke member. Please try again.',
      );
    }
  }

  // --------------------------
  // Validate and switch organization
  // --------------------------
  async validateAndSwitchOrganization(userId: string, organizationId: string) {
    try {
      const membership = await this.prisma.organizationMember.findFirst({
        where: {
          userId,
          organizationId,
          deletedAt: null,
        },
        include: {
          organization: true,
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'You are not a member of this organization',
        );
      }

      return {
        success: true,
        message: 'Organization context switched successfully',
        data: {
          organization: {
            id: membership.organization.id,
            name: membership.organization.name,
            slug: membership.organization.slug,
          },
          membership: {
            id: membership.id,
            role: membership.role,
            joinedAt: membership.joinedAt,
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Error switching organization for user ${userId}`,
        error,
      );
      throw new BadRequestException(
        'Failed to switch organization. Please try again.',
      );
    }
  }

  // --------------------------
  // Create default organization for user (used when none exists)
  // --------------------------
  async createDefaultOrganization(userId: string, userEmail: string) {
    try {
      const userName = userEmail.split('@')[0];
      const orgName = `${userName}'s Workspace`;
      const baseSlug = this.generateSlug(orgName);

      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await this.prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const org = await this.prisma.organization.create({
        data: {
          name: orgName,
          slug,
          members: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: true,
        },
      });

      this.logger.log(`Default organization created for user ${userId}`);

      return {
        organization: org,
        membership: org.members[0],
      };
    } catch (error) {
      this.logger.error(
        `Error creating default organization for user ${userId}`,
        error,
      );
      throw new BadRequestException(
        'Failed to create default organization. Please try again.',
      );
    }
  }

  // Helper method to generate slug from name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
  }
}
