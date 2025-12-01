/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private prisma: PrismaService) {}

  // --------------------------
  // Create organization
  // --------------------------
  async createOrganization(dto: CreateOrganizationDto, ownerId: string) {
    try {
      this.logger.log(`Creating organization "${dto.name}" by user ${ownerId}`);

      // Generate a unique slug if not provided or if it might be duplicate
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
        include: { members: true },
      });

      this.logger.log(`Organization created with id ${org.id}`);
      return { success: true, message: 'Organization created', data: org };
    } catch (error) {
      this.logger.error('Error creating organization', error);

      // Handle specific error cases
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error.code === 'P2002') {
        // Prisma unique constraint error
        const constraint = error.meta?.target || error.meta?.constraint?.fields;
        if (constraint && constraint.includes('slug')) {
          throw new ConflictException(
            'Organization with this slug already exists. Please choose a different slug.',
          );
        }
        if (constraint && constraint.includes('name')) {
          throw new ConflictException(
            'Organization with this name already exists. Please choose a different name.',
          );
        }
      }

      throw new BadRequestException(
        'Failed to create organization. Please try again with a different name or slug.',
      );
    }
  }

  // --------------------------
  // List organizations for a user (paginated)
  // --------------------------
  async listUserOrganizations(userId: string, page = 1, perPage = 10) {
    try {
      const skip = (page - 1) * perPage;

      const [orgs, total] = await Promise.all([
        this.prisma.organizationMember.findMany({
          where: { userId, deletedAt: null },
          include: { organization: true },
          skip,
          take: perPage,
        }),
        this.prisma.organizationMember.count({
          where: { userId, deletedAt: null },
        }),
      ]);

      return {
        success: true,
        message: 'Organizations fetched successfully',
        data: orgs,
        page,
        perPage,
        total,
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
  // Update organization
  // --------------------------
  async updateOrganization(
    orgId: string,
    dto: UpdateOrganizationDto,
    userId: string,
  ) {
    try {
      const member = await this.prisma.organizationMember.findFirst({
        where: { organizationId: orgId, userId, deletedAt: null },
      });
      if (!member || member.role !== 'OWNER')
        throw new ForbiddenException(
          'Only organization owners can update organization details',
        );

      // Check for duplicate slug if slug is being updated
      if (dto.slug) {
        const existingOrg = await this.prisma.organization.findFirst({
          where: {
            slug: dto.slug,
            id: { not: orgId }, // Exclude current organization
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
  ) {
    try {
      const inviter = await this.prisma.organizationMember.findFirst({
        where: {
          organizationId: orgId,
          userId: inviterUserId,
          role: 'OWNER',
          deletedAt: null,
        },
      });
      if (!inviter)
        throw new ForbiddenException(
          'Only organization owners can invite members',
        );

      // Check if user is already a member
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
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

      // Check for existing pending invite
      const existingInvite = await this.prisma.organizationInvite.findFirst({
        where: {
          organizationId: orgId,
          email,
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
          invitedById: inviter.id,
        },
      });

      await this.prisma.invitationLog.create({
        data: {
          inviteToken: token,
          invitedEmail: email,
          organizationId: orgId,
          inviterMemberId: inviter.id,
        },
      });

      return {
        success: true,
        message: `Invitation sent to ${email}`,
        data: invite,
      };
    } catch (error) {
      this.logger.error(
        `Error inviting member ${email} to org ${orgId}`,
        error,
      );

      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException
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
  async acceptInvitation(token: string, userId: string) {
    try {
      const invite = await this.prisma.organizationInvite.findFirst({
        where: { token, deletedAt: null, expires: { gt: new Date() } },
        include: { organization: true },
      });
      if (!invite) throw new NotFoundException('Invalid or expired invitation');

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.email !== invite.email)
        throw new ForbiddenException(
          'This invitation was sent to a different email address',
        );

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

      const member = await this.prisma.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId,
          role: invite.role,
        },
      });

      await this.prisma.invitationLog.updateMany({
        where: { inviteToken: token, status: 'PENDING' },
        data: {
          status: 'ACCEPTED',
          acceptedByUserId: userId,
          acceptedByMemberId: member.id,
        },
      });

      await this.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { deletedAt: new Date() },
      });

      return {
        success: true,
        message: 'Invitation accepted successfully',
        data: member,
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
          where: { organizationId: orgId, deletedAt: null },
          include: { user: true },
          skip,
          take: perPage,
        }),
        this.prisma.organizationMember.count({
          where: { organizationId: orgId, deletedAt: null },
        }),
      ]);

      return {
        success: true,
        message: 'Members fetched successfully',
        data: members,
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
  async revokeMember(orgId: string, memberId: string, ownerId: string) {
    try {
      const owner = await this.prisma.organizationMember.findFirst({
        where: {
          organizationId: orgId,
          userId: ownerId,
          role: 'OWNER',
          deletedAt: null,
        },
      });
      if (!owner)
        throw new ForbiddenException(
          'Only organization owners can revoke member access',
        );

      const member = await this.prisma.organizationMember.findUnique({
        where: { id: memberId },
      });
      if (!member) throw new NotFoundException('Member not found');

      // Prevent owners from revoking themselves
      if (member.userId === ownerId) {
        throw new ForbiddenException('Cannot revoke your own access as owner');
      }

      await this.prisma.organizationMember.update({
        where: { id: memberId },
        data: { deletedAt: new Date() },
      });

      return { success: true, message: 'Member access revoked successfully' };
    } catch (error) {
      this.logger.error(
        `Error revoking member ${memberId} from org ${orgId}`,
        error,
      );

      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to revoke member. Please try again.',
      );
    }
  }

  // Helper method to generate slug from name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50); // Limit slug length
  }
}
