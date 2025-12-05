/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { sendEmail } from '../lib/nodemailer';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  // Create organization
  async createOrganization(dto: CreateOrganizationDto, ownerId: string) {
    try {
      this.logger.log(`Creating organization "${dto.name}" by user ${ownerId}`);

      // Generate a unique slug if not provided
      let finalSlug = dto.slug;
      if (!finalSlug) {
        finalSlug = this.generateSlug(dto.name);
      }

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

  async listUserOrganizations(
    userId: string,
    memberships: any[],
    page = 1,
    perPage = 10,
  ) {
    try {
      const skip = (page - 1) * perPage;
      const paginatedMemberships = memberships.slice(skip, skip + perPage);

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

  async updateOrganization(
    orgId: string,
    dto: UpdateOrganizationDto,
    userId: string,
    userRole: string,
  ) {
    try {
      if (userRole !== 'OWNER') {
        throw new ForbiddenException(
          'Only organization owners can update organization details',
        );
      }

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

  async inviteMember(
    orgId: string,
    email: string,
    role: 'MEMBER' | 'OWNER',
    inviterUserId: string,
    inviterMemberId: string,
  ) {
    try {
      const normalizedEmail = email.toLowerCase();

      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      const inviterUser = await this.prisma.user.findUnique({
        where: { id: inviterUserId },
        select: { name: true, email: true },
      });

      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
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

      const existingInvite = await this.prisma.organizationInvite.findFirst({
        where: {
          organizationId: orgId,
          email: normalizedEmail,
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

      await this.sendInvitationEmail(
        email,
        token,
        organization.name,
        inviterUser?.name || inviterUser?.email || 'A team member',
      );

      this.logger.log(
        `Invitation sent to ${email} for org ${organization.name}`,
      );

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

  private async sendInvitationEmail(
    toEmail: string,
    token: string,
    organizationName: string,
    inviterName?: string,
  ) {
    try {
      const baseUrl =
        process.env.FRONTEND_URL || 'https://tenanncy.onrender.com';
      const invitationUrl = `${baseUrl}/api/organization/accept-invite/${token}`;

      const subject = `You've been invited to join ${organizationName} on Tenanncy`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #fff; border-radius: 8px; border: 1px solid #eaeaea; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .title { font-size: 20px; font-weight: 600; margin: 0 0 10px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .info-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .url-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-family: monospace; word-break: break-all; font-size: 14px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 14px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Tenanncy</div>
              <h1 class="title">Organization Invitation</h1>
            </div>
            
            <p>Hello,</p>
            
            <p>You've been invited to join <strong>${organizationName}</strong> on Tenanncy!</p>
            
            ${inviterName ? `<p><strong>${inviterName}</strong> has invited you to collaborate.</p>` : ''}
            
            <div class="info-box">
              <p><strong>Organization:</strong> ${organizationName}</p>
              <p>Tenanncy helps teams manage tenant relationships and property documentation efficiently.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">Accept Invitation</a>
            </div>
            
            <p>Or copy this link:</p>
            <div class="url-box">${invitationUrl}</div>
            
            <p><small>This invitation expires in 7 days.</small></p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tenanncy. All rights reserved.</p>
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Organization Invitation - Tenanncy
===================================

You've been invited to join ${organizationName} on Tenanncy!

${inviterName ? `Invited by: ${inviterName}\n` : ''}
Organization: ${organizationName}

Accept your invitation here: ${invitationUrl}

This invitation expires in 7 days.

If you don't have a Tenanncy account yet, you'll be prompted to create one.

© ${new Date().getFullYear()} Tenanncy. All rights reserved.
      `;

      await sendEmail(toEmail, subject, html, text);

      this.logger.log(`Invitation email sent to ${toEmail}`);
    } catch (emailError) {
      this.logger.error(
        `Failed to send invitation email to ${toEmail}:`,
        emailError,
      );
    }
  }

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

      if (userEmail !== invite.email) {
        throw new ForbiddenException(
          'This invitation was sent to a different email address',
        );
      }

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

      await this.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(
        `User ${userId} accepted invitation to org ${invite.organization.name}`,
      );

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

  async revokeMember(
    orgId: string,
    targetMemberId: string,
    ownerId: string,
    ownerRole: string,
  ) {
    try {
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

      if (targetMember.organizationId !== orgId) {
        throw new BadRequestException(
          'Member does not belong to this organization',
        );
      }

      if (targetMember.userId === ownerId) {
        throw new ForbiddenException('Cannot revoke your own access as owner');
      }

      if (targetMember.role === 'OWNER') {
        throw new ForbiddenException('Cannot revoke another owner');
      }

      await this.prisma.organizationMember.update({
        where: { id: targetMemberId },
        data: { deletedAt: new Date() },
      });

      this.logger.log(
        `Member ${targetMember.user.email} revoked from org ${orgId}`,
      );

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

  async createDefaultOrganization(userId: string, userEmail: string) {
    try {
      const userName = userEmail.split('@')[0];
      const orgName = `${userName}'s Workspace`;
      const baseSlug = this.generateSlug(orgName);

      let slug = baseSlug;
      let counter = 1;

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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
  }
}
