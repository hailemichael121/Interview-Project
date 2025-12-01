import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get profile for logged-in user
  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  // Update profile for logged-in user
  @Put('profile')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  // Admin-only: list all users with pagination
  @Get()
  @Roles('OWNER')
  findAll(@Query('page') page?: number, @Query('perPage') perPage?: number) {
    return this.usersService.findAll(page || 1, perPage || 10);
  }

  // Return full session user object
  @Get('me')
  getCurrentUser(@CurrentUser() user: unknown) {
    return { success: true, data: user };
  }

  // Get invitations for current user
  @Get('invitations')
  getInvitations(@CurrentUser('id') userId: string) {
    return this.usersService.getUserInvitations(userId);
  }
}
