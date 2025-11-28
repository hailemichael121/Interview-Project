import { Controller, Get, Post, Put, Delete, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { OutlinesService } from './outlines.service';
import { AuthService } from '../auth/auth.service';
import { getSessionFromRequest } from '../lib/session.helper';

@Controller('api/outlines')
export class OutlinesController {
  constructor(private readonly outlinesService: OutlinesService, private readonly authService: AuthService) {}

  @Get()
  async list(@Req() req: Request) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    return this.outlinesService.findAllByOrganization(orgId);
  }

  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    const payload = {
      header: body.header,
      sectionType: body.sectionType,
      status: body.status ?? 'PENDING',
      target: body.target ?? 0,
      limit: body.limit ?? 0,
      reviewer: body.reviewer,
      organizationId: orgId,
      userId: session.userId,
    };

    return this.outlinesService.create(payload);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    const existing = await this.outlinesService.findOne(id);
    if (!existing || existing.organizationId !== orgId) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    return this.outlinesService.update(id, body);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    const existing = await this.outlinesService.findOne(id);
    if (!existing || existing.organizationId !== orgId) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    return this.outlinesService.remove(id);
  }
}
