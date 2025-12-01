// src/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnhancedAuthGuard } from '../auth/guards/enhanced-auth.guard';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(EnhancedAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get profile for logged-in user
  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  // Update profile for logged-in user
  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Prevent users from changing their role to admin/owner through profile update
    if (updateUserDto.role && ['OWNER', 'ADMIN'].includes(updateUserDto.role)) {
      throw new BadRequestException(
        'Cannot change role to OWNER or ADMIN through profile update',
      );
    }

    return this.usersService.updateUser(userId, updateUserDto);
  }

  // List all users with pagination (admin only)
  @Get()
  async findAll(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    // Check if user is admin
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'OWNER') {
      throw new BadRequestException('Only admins can list all users');
    }

    return this.usersService.findAll(page || 1, perPage || 10);
  }

  // Return full session user object with context
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: any,
    @CurrentUser('memberships') memberships: any[],
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberRole') memberRole: Role,
  ) {
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          image: user.image,
          emailVerified: user.emailVerified,
          banned: user.banned,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        context: {
          currentOrganizationId: organizationId,
          currentMemberRole: memberRole,
          organizationMemberships: memberships.map((m) => ({
            organizationId: m.organizationId,
            organization: m.organization,
            role: m.role,
            memberId: m.id,
            joinedAt: m.joinedAt,
          })),
        },
      },
    };
  }

  // Get invitations for current user
  @Get('invitations')
  async getInvitations(@CurrentUser('id') userId: string) {
    return this.usersService.getUserInvitations(userId);
  }

  // Accept an invitation
  @Post('invitations/:invitationId/accept')
  async acceptInvitation(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.usersService.acceptInvitation(userId, userEmail, invitationId);
  }

  // Decline an invitation
  @Post('invitations/:invitationId/decline')
  async declineInvitation(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.usersService.declineInvitation(userId, userEmail, invitationId);
  }

  // Get user by ID (admin only)
  @Get(':id')
  async getUserById(
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
  ) {
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'OWNER') {
      throw new BadRequestException('Only admins can view user details');
    }

    return this.usersService.findById(id);
  }

  // Update user by ID (admin only)
  @Put(':id')
  async updateUserById(
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'OWNER') {
      throw new BadRequestException('Only admins can update other users');
    }

    return this.usersService.updateUser(id, updateUserDto);
  }

  // Soft delete user (admin only)
  @Delete(':id')
  async deleteUser(
    @CurrentUser('role') currentUserRole: string,
    @CurrentUser('id') currentUserId: string,
    @Param('id') id: string,
  ) {
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'OWNER') {
      throw new BadRequestException('Only admins can delete users');
    }

    // Prevent self-deletion
    if (currentUserId === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    return this.usersService.softDelete(id);
  }

  // Get user's organizations
  @Get(':id/organizations')
  async getUserOrganizations(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    // Users can view their own organizations, admins can view anyone's
    if (
      currentUserId !== id &&
      currentUserRole !== 'ADMIN' &&
      currentUserRole !== 'OWNER'
    ) {
      throw new BadRequestException('You can only view your own organizations');
    }

    return this.usersService.getUserOrganizations(id, page || 1, perPage || 10);
  }

  // Search users by email or name (admin only)
  @Get('search/:query')
  async searchUsers(
    @CurrentUser('role') currentUserRole: string,
    @Param('query') query: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'OWNER') {
      throw new BadRequestException('Only admins can search users');
    }

    return this.usersService.searchUsers(query, page || 1, perPage || 10);
  }
}
