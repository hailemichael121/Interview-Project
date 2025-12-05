// In users.controller.ts
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

@Controller('users')
@UseGuards(EnhancedAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Get()
  async findAll(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    const normalizedRole = currentUserRole?.toUpperCase();
    if (normalizedRole !== 'OWNER') {
      throw new BadRequestException(
        'Only organization owners can list all users',
      );
    }

    return this.usersService.findAll(page || 1, perPage || 10);
  }

  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: any,
    @CurrentUser('memberships') memberships: any[],
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberRole') memberRole: string,
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

  @Get('invitations')
  async getInvitations(@CurrentUser('id') userId: string) {
    return this.usersService.getUserInvitations(userId);
  }

  @Post('invitations/:invitationId/accept')
  async acceptInvitation(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.usersService.acceptInvitation(userId, userEmail, invitationId);
  }

  @Post('invitations/:invitationId/decline')
  async declineInvitation(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.usersService.declineInvitation(userId, userEmail, invitationId);
  }

  @Get(':id')
  async getUserById(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
  ) {
    if (currentUserId === id) {
      return this.usersService.findById(id);
    }

    const normalizedRole = currentUserRole?.toUpperCase();
    if (normalizedRole !== 'OWNER') {
      throw new BadRequestException('Only owners can view other user details');
    }

    return this.usersService.findById(id);
  }

  @Put(':id')
  async updateUserById(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (currentUserId === id) {
      return this.usersService.updateUser(id, updateUserDto);
    }

    const normalizedRole = currentUserRole?.toUpperCase();
    if (normalizedRole !== 'OWNER') {
      throw new BadRequestException('Only owners can update other users');
    }

    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
  ) {
    if (currentUserId === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const normalizedRole = currentUserRole?.toUpperCase();
    if (normalizedRole !== 'OWNER') {
      throw new BadRequestException('Only owners can delete users');
    }

    return this.usersService.softDelete(id);
  }

  @Get(':id/organizations')
  async getUserOrganizations(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    if (currentUserId === id) {
      return this.usersService.getUserOrganizations(
        id,
        page || 1,
        perPage || 10,
      );
    }

    const normalizedRole = currentUserRole?.toUpperCase();
    if (normalizedRole !== 'OWNER') {
      throw new BadRequestException('You can only view your own organizations');
    }

    return this.usersService.getUserOrganizations(id, page || 1, perPage || 10);
  }

  @Get('search/:query')
  async searchUsers(
    @CurrentUser('role') currentUserRole: string,
    @Param('query') query: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    const normalizedRole = currentUserRole?.toUpperCase();
    if (normalizedRole !== 'OWNER') {
      throw new BadRequestException('Only owners can search users');
    }

    return this.usersService.searchUsers(query, page || 1, perPage || 10);
  }
}
