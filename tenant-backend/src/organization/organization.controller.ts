/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { EnhancedAuthGuard } from '../auth/guards/enhanced-auth.guard';

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
    return this.service.listUserOrganizations(
      userId,
      memberships,
      Number(page),
      Number(perPage),
    );
  }

  @Put(':id')
  async updateOrg(
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: any[],
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const membership = memberships.find((m) => m.organizationId === id);
    if (!membership) {
      throw new BadRequestException(
        'You are not a member of this organization',
      );
    }

    return this.service.updateOrganization(id, dto, userId, membership.role);
  }

  @Get(':id/members')
  async listMembers(
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: any[],
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
  ) {
    const membership = memberships.find((m) => m.organizationId === id);
    if (!membership) {
      throw new BadRequestException(
        'You are not a member of this organization',
      );
    }

    if (!['OWNER', 'REVIEWER'].includes(membership.role)) {
      throw new BadRequestException(
        'You do not have permission to view organization members',
      );
    }

    return this.service.listMembers(id, Number(page), Number(perPage));
  }

  @Post(':id/invite')
  async inviteMember(
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: any[],
    @Param('id') id: string,
    @Body() body: { email: string; role: 'MEMBER' | 'OWNER' },
  ) {
    const membership = memberships.find((m) => m.organizationId === id);
    if (!membership) {
      throw new BadRequestException(
        'You are not a member of this organization',
      );
    }

    if (membership.role !== 'OWNER') {
      throw new BadRequestException(
        'Only organization owners can invite members',
      );
    }

    return this.service.inviteMember(
      id,
      body.email,
      body.role,
      userId,
      membership.id,
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
  async revokeMember(
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: any[],
    @Param('id') id: string,
    @Body('memberId') targetMemberId: string,
  ) {
    const membership = memberships.find((m) => m.organizationId === id);
    if (!membership) {
      throw new BadRequestException(
        'You are not a member of this organization',
      );
    }

    if (membership.role !== 'OWNER') {
      throw new BadRequestException(
        'Only organization owners can revoke members',
      );
    }

    return this.service.revokeMember(
      id,
      targetMemberId,
      userId,
      membership.role,
    );
  }

  @Post(':id/switch')
  async switchOrganization(
    @CurrentUser('id') userId: string,
    @Param('id') organizationId: string,
  ) {
    return this.service.validateAndSwitchOrganization(userId, organizationId);
  }

  @Get(':id')
  async getOrganization(
    @CurrentUser('memberships') memberships: any[],
    @Param('id') id: string,
  ) {
    const isMember = memberships.some((m) => m.organizationId === id);
    if (!isMember) {
      throw new BadRequestException(
        'You are not a member of this organization',
      );
    }

    return this.service.getOrganizationDetails(id);
  }
}
