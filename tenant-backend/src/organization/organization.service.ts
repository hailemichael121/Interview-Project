import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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

      const org = await this.prisma.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
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
      throw new BadRequestException('Failed to create organization');
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
        message: 'Organizations fetched',
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
      throw new BadRequestException('Failed to list organizations');
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
        throw new ForbiddenException('Only owners can update organization');

      const org = await this.prisma.organization.update({
        where: { id: orgId },
        data: dto,
      });
      return { success: true, message: 'Organization updated', data: org };
    } catch (error) {
      this.logger.error(`Error updating organization ${orgId}`, error);
      throw new BadRequestException('Failed to update organization');
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
      if (!inviter) throw new ForbiddenException('Only owners can invite');

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
      throw new BadRequestException('Failed to invite member');
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
        throw new ForbiddenException('Email mismatch');

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

      return { success: true, message: 'Invitation accepted', data: member };
    } catch (error) {
      this.logger.error(
        `Error accepting invitation with token ${token}`,
        error,
      );
      throw new BadRequestException('Failed to accept invitation');
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
        message: 'Members fetched',
        data: members,
        page,
        perPage,
        total,
      };
    } catch (error) {
      this.logger.error(`Error listing members for org ${orgId}`, error);
      throw new BadRequestException('Failed to list members');
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
      if (!owner) throw new ForbiddenException('Only owners can revoke');

      const member = await this.prisma.organizationMember.findUnique({
        where: { id: memberId },
      });
      if (!member) throw new NotFoundException('Member not found');

      await this.prisma.organizationMember.update({
        where: { id: memberId },
        data: { deletedAt: new Date() },
      });

      return { success: true, message: 'Member access revoked' };
    } catch (error) {
      this.logger.error(
        `Error revoking member ${memberId} from org ${orgId}`,
        error,
      );
      throw new BadRequestException('Failed to revoke member');
    }
  }
}
