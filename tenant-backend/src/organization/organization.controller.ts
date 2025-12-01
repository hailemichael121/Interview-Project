// src/organization/organization.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { EnhancedAuthGuard } from '../auth/guards/enhanced-auth.guard';
import { Role } from '@prisma/client';

@Controller('api/organization')
@UseGuards(EnhancedAuthGuard)
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post('create')
  async createOrg(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.service.createOrganization(dto, userId);
  }

  @Get()
  async listUserOrgs(
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: any[],
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
  ) {
    // Use memberships from auth context instead of querying again
    return this.service.listUserOrganizations(
      userId,
      memberships,
      Number(page),
      Number(perPage),
    );
  }

  @Put(':id')
  @UseGuards(OrganizationGuard)
  async updateOrg(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    // Verify the organization ID in params matches context
    if (id !== organizationId) {
      throw new BadRequestException('Organization ID mismatch');
    }

    return this.service.updateOrganization(id, dto, userId, memberRole);
  }

  @Get(':id/members')
  @UseGuards(OrganizationGuard)
  async listMembers(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
  ) {
    // Verify the organization ID in params matches context
    if (id !== organizationId) {
      throw new BadRequestException('Organization ID mismatch');
    }

    // Check if user has permission to view members
    if (!['OWNER', 'REVIEWER'].includes(memberRole)) {
      throw new BadRequestException(
        'You do not have permission to view organization members',
      );
    }

    return this.service.listMembers(id, Number(page), Number(perPage));
  }

  @Post(':id/invite')
  @UseGuards(OrganizationGuard)
  async inviteMember(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @CurrentUser('memberId') memberId: string,
    @Param('id') id: string,
    @Body() body: { email: string; role: 'MEMBER' | 'OWNER' },
  ) {
    // Verify the organization ID in params matches context
    if (id !== organizationId) {
      throw new BadRequestException('Organization ID mismatch');
    }

    // Check if user has permission to invite members
    if (memberRole !== 'OWNER') {
      throw new BadRequestException(
        'Only organization owners can invite members',
      );
    }

    return this.service.inviteMember(
      id,
      body.email,
      body.role,
      userId,
      memberId,
    );
  }

  @Post('accept-invite/:token')
  async acceptInvite(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
  ) {
    return this.service.acceptInvitation(token, userId, userEmail);
  }

  @Post(':id/revoke')
  @UseGuards(OrganizationGuard)
  async revokeMember(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @Param('id') id: string,
    @Body('memberId') targetMemberId: string,
  ) {
    // Verify the organization ID in params matches context
    if (id !== organizationId) {
      throw new BadRequestException('Organization ID mismatch');
    }

    // Check if user has permission to revoke members
    if (memberRole !== 'OWNER') {
      throw new BadRequestException(
        'Only organization owners can revoke members',
      );
    }

    return this.service.revokeMember(
      organizationId,
      targetMemberId,
      userId,
      memberRole,
    );
  }

  // New endpoint to switch organization context
  @Post(':id/switch')
  async switchOrganization(
    @CurrentUser('id') userId: string,
    @Param('id') organizationId: string,
  ) {
    return this.service.validateAndSwitchOrganization(userId, organizationId);
  }

  // Get organization details
  @Get(':id')
  @UseGuards(OrganizationGuard)
  async getOrganization(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    if (id !== organizationId) {
      throw new BadRequestException('Organization ID mismatch');
    }
    return this.service.getOrganizationDetails(organizationId);
  }
}
