import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('api/organization')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post('create')
  async createOrg(
    @Session() session: UserSession,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.service.createOrganization(dto, session.user.id);
  }

  @Get()
  async listUserOrgs(
    @Session() session: UserSession,
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
  ) {
    return this.service.listUserOrganizations(
      session.user.id,
      Number(page),
      Number(perPage),
    );
  }

  @Put(':id')
  async updateOrg(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.service.updateOrganization(id, dto, session.user.id);
  }

  @Get(':id/members')
  async listMembers(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '10',
  ) {
    return this.service.listMembers(id, Number(page), Number(perPage));
  }

  @Post(':id/invite')
  async inviteMember(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: { email: string; role: 'MEMBER' | 'OWNER' },
  ) {
    return this.service.inviteMember(
      id,
      body.email,
      body.role,
      session.user.id,
    );
  }

  @Post('accept-invite/:token')
  async acceptInvite(
    @Param('token') token: string,
    @Session() session: UserSession,
  ) {
    return this.service.acceptInvitation(token, session.user.id);
  }

  @Post(':id/revoke')
  async revokeMember(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body('memberId') memberId: string,
  ) {
    return this.service.revokeMember(id, memberId, session.user.id);
  }
}
