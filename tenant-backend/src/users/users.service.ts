// src/users/users.service.ts - Remove ADMIN references from error messages
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  // Get full profile for frontend consumption
  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          banned: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          // Organization memberships with more details
          members: {
            where: { deletedAt: null },
            include: {
              organization: {
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
              },
            },
            orderBy: { joinedAt: 'desc' },
          },
          // Reviewer profile & outlines
          reviewerProfile: {
            select: {
              id: true,
              outlines: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  header: true,
                  status: true,
                  sectionType: true,
                  organizationId: true,
                  createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10, // Limit recent outlines
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Fetch pending invitations with organization details
      const invitations = user.email
        ? await this.prisma.organizationInvite.findMany({
            where: {
              email: user.email,
              deletedAt: null,
              expires: { gt: new Date() },
            },
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  createdAt: true,
                },
              },
              logs: {
                where: { status: 'PENDING' },
                take: 1,
                select: {
                  invitedAt: true,
                  organizationName: true,
                  organizationSlug: true,
                },
              },
            },
            orderBy: { expires: 'asc' },
          })
        : [];

      // Format the response
      return {
        success: true,
        data: {
          ...user,
          memberships: user.members.map((member) => ({
            memberId: member.id,
            role: member.role,
            joinedAt: member.joinedAt,
            organization: member.organization,
          })),
          invitations: invitations.map((invite) => ({
            id: invite.id,
            organization: invite.organization,
            role: invite.role,
            expires: invite.expires,
            invitedAt: invite.logs[0]?.invitedAt || invite.expires,
          })),
          stats: {
            totalOrganizations: user.members.length,
            pendingInvitations: invitations.length,
            assignedOutlines: user.reviewerProfile?.outlines.length || 0,
          },
        },
      };
    } catch (error: unknown) {
      this.logger.error(`Error fetching profile for user ${userId}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user profile';
      throw new BadRequestException(errorMessage);
    }
  }

  // Update user
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Prepare update data
      const updateData: any = { updatedAt: new Date() };

      // Only include provided fields
      if (updateUserDto.name !== undefined)
        updateData.name = updateUserDto.name;
      if (updateUserDto.role !== undefined)
        updateData.role = updateUserDto.role;
      if (updateUserDto.tenantId !== undefined)
        updateData.tenantId = updateUserDto.tenantId;
      if (updateUserDto.image !== undefined)
        updateData.image = updateUserDto.image;
      if (updateUserDto.emailVerified !== undefined)
        updateData.emailVerified = updateUserDto.emailVerified;

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          banned: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User ${userId} updated successfully`);

      return {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      };
    } catch (error: unknown) {
      this.logger.error(`Error updating user ${userId}`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if ((error as any).code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update user';
      throw new BadRequestException(errorMessage);
    }
  }

  // List users (with pagination)
  async findAll(page = 1, perPage = 10) {
    try {
      const skip = (page - 1) * perPage;
      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where: { deletedAt: null },
          skip,
          take: perPage,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            tenantId: true,
            banned: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                members: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        }),
        this.prisma.user.count({ where: { deletedAt: null } }),
      ]);

      return {
        success: true,
        data: data.map((user) => ({
          ...user,
          organizationCount: user._count.members,
        })),
        page,
        perPage,
        total,
      };
    } catch (error: unknown) {
      this.logger.error('Error listing users', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to list users';
      throw new BadRequestException(errorMessage);
    }
  }

  // Soft delete
  async softDelete(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is the last owner in any organizations
      const ownedOrganizations = await this.prisma.organizationMember.findMany({
        where: {
          userId,
          role: Role.OWNER,
          deletedAt: null,
        },
        include: {
          organization: {
            include: {
              members: {
                where: {
                  role: Role.OWNER,
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      // Check for organizations where user is the only owner
      const soleOwnedOrgs = ownedOrganizations.filter(
        (membership) => membership.organization.members.length === 1,
      );

      if (soleOwnedOrgs.length > 0) {
        const orgNames = soleOwnedOrgs
          .map((m) => m.organization.name)
          .join(', ');
        throw new BadRequestException(
          `Cannot delete user. User is the only owner of organization(s): ${orgNames}. ` +
            'Please transfer ownership first.',
        );
      }

      const deletedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          deletedAt: true,
        },
      });

      // Soft delete all organization memberships
      await this.prisma.organizationMember.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`User ${userId} soft-deleted`);

      return {
        success: true,
        message: 'User soft-deleted successfully',
        data: deletedUser,
      };
    } catch (error: unknown) {
      this.logger.error(`Error soft-deleting user ${userId}`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete user';
      throw new BadRequestException(errorMessage);
    }
  }

  // Get invitations only
  async getUserInvitations(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const invitations = await this.prisma.organizationInvite.findMany({
        where: {
          email: user.email,
          deletedAt: null,
          expires: { gt: new Date() },
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              createdAt: true,
            },
          },
        },
        orderBy: { expires: 'asc' },
      });

      return {
        success: true,
        data: invitations.map((invite) => ({
          id: invite.id,
          organization: invite.organization,
          role: invite.role,
          expires: invite.expires,
          token: invite.token,
        })),
        message:
          invitations.length > 0
            ? 'Invitations fetched successfully'
            : 'No pending invitations',
      };
    } catch (error: unknown) {
      this.logger.error(`Error fetching invitations for user ${userId}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch invitations';
      throw new BadRequestException(errorMessage);
    }
  }

  // Accept an invitation
  async acceptInvitation(
    userId: string,
    userEmail: string,
    invitationId: string,
  ) {
    try {
      const invitation = await this.prisma.organizationInvite.findUnique({
        where: { id: invitationId },
        include: {
          organization: true,
        },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.email !== userEmail) {
        throw new BadRequestException(
          'This invitation was sent to a different email address',
        );
      }

      if (invitation.expires < new Date()) {
        throw new BadRequestException('Invitation has expired');
      }

      // Check if user is already a member
      const existingMember = await this.prisma.organizationMember.findFirst({
        where: {
          userId,
          organizationId: invitation.organizationId,
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
          organizationId: invitation.organizationId,
          userId,
          role: invitation.role as Role,
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

      // Mark invitation as accepted
      await this.prisma.organizationInvite.update({
        where: { id: invitationId },
        data: { deletedAt: new Date() },
      });

      // Update invitation log
      await this.prisma.invitationLog.updateMany({
        where: {
          inviteToken: invitation.token,
          status: 'PENDING',
        },
        data: {
          status: 'ACCEPTED',
          acceptedByUserId: userId,
          acceptedByMemberId: member.id,
        },
      });

      this.logger.log(
        `User ${userId} accepted invitation to organization ${invitation.organizationId}`,
      );

      return {
        success: true,
        data: {
          organization: member.organization,
          membership: {
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt,
          },
        },
        message: 'Invitation accepted successfully',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error accepting invitation ${invitationId} for user ${userId}`,
        error,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to accept invitation';
      throw new BadRequestException(errorMessage);
    }
  }

  // Decline an invitation
  async declineInvitation(
    userId: string,
    userEmail: string,
    invitationId: string,
  ) {
    try {
      const invitation = await this.prisma.organizationInvite.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.email !== userEmail) {
        throw new BadRequestException(
          'This invitation was sent to a different email address',
        );
      }

      // Mark invitation as declined
      await this.prisma.organizationInvite.update({
        where: { id: invitationId },
        data: { deletedAt: new Date() },
      });

      // Update invitation log
      await this.prisma.invitationLog.updateMany({
        where: {
          inviteToken: invitation.token,
          status: 'PENDING',
        },
        data: {
          status: 'REVOKED',
        },
      });

      this.logger.log(`User ${userId} declined invitation ${invitationId}`);

      return {
        success: true,
        message: 'Invitation declined successfully',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error declining invitation ${invitationId} for user ${userId}`,
        error,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to decline invitation';
      throw new BadRequestException(errorMessage);
    }
  }

  // Find user by email
  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          banned: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error: unknown) {
      this.logger.error(`Error finding user by email: ${email}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to find user';
      throw new BadRequestException(errorMessage);
    }
  }

  // Find user by ID
  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          banned: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          members: {
            where: { deletedAt: null },
            select: {
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error: unknown) {
      this.logger.error(`Error finding user by ID: ${id}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to find user';
      throw new BadRequestException(errorMessage);
    }
  }

  // Get user's organizations
  async getUserOrganizations(userId: string, page = 1, perPage = 10) {
    try {
      const skip = (page - 1) * perPage;

      const [memberships, total] = await Promise.all([
        this.prisma.organizationMember.findMany({
          where: {
            userId,
            deletedAt: null,
          },
          skip,
          take: perPage,
          include: {
            organization: {
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
            },
          },
          orderBy: { joinedAt: 'desc' },
        }),
        this.prisma.organizationMember.count({
          where: { userId, deletedAt: null },
        }),
      ]);

      return {
        success: true,
        data: memberships.map((membership) => ({
          memberId: membership.id,
          role: membership.role,
          joinedAt: membership.joinedAt,
          organization: membership.organization,
        })),
        page,
        perPage,
        total,
        message: 'Organizations fetched successfully',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching organizations for user ${userId}`,
        error,
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch organizations';
      throw new BadRequestException(errorMessage);
    }
  }

  // Search users
  async searchUsers(query: string, page = 1, perPage = 10) {
    try {
      const skip = (page - 1) * perPage;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            deletedAt: null,
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
          skip,
          take: perPage,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                members: {
                  where: { deletedAt: null },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({
          where: {
            deletedAt: null,
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      return {
        success: true,
        data: users.map((user) => ({
          ...user,
          organizationCount: user._count.members,
        })),
        page,
        perPage,
        total,
        message: users.length > 0 ? 'Users found' : 'No users found',
      };
    } catch (error: unknown) {
      this.logger.error(`Error searching users with query: ${query}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search users';
      throw new BadRequestException(errorMessage);
    }
  }
}
