import { Controller, Get, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { prisma } from '../lib/prisma';
import { getSessionFromRequest } from '../lib/session.helper';

@Controller('api/team')
export class TeamController {
  constructor(private readonly authService: AuthService) {}

  @Get('members')
  async listMembers(@Req() req: Request) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    const members = await prisma.organizationMember.findMany({ 
      where: { organizationId: orgId }, 
      include: { user: true },
      orderBy: { joinedAt: 'asc' }
    });
    
    return members.map(m => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      }
    }));
  }

  @Post('invite')
  async invite(@Req() req: Request, @Body() body: { email: string; role?: string }) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    // Check that current user is owner
    const me = await prisma.organizationMember.findFirst({ 
      where: { 
        organizationId: orgId, 
        userId: session.userId 
      } 
    });
    
    if (!me || me.role !== 'owner') {
      throw new HttpException('Only owners can invite', HttpStatus.FORBIDDEN);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    // Check if already a member
    if (existingUser) {
      const existingMember = await prisma.organizationMember.findFirst({
        where: {
          organizationId: orgId,
          userId: existingUser.id
        }
      });
      
      if (existingMember) {
        throw new HttpException('User is already a member', HttpStatus.BAD_REQUEST);
      }
    }

    // Use Better Auth organization invite API
    try {
      // Call Better Auth's organization invite API via handler
      const headers: Record<string, string> = {};
      Object.entries(req.headers).forEach(([k, v]) => {
        if (v) headers[k] = Array.isArray(v) ? v.join(', ') : (v as string);
      });

      const inviteHandler = await this.authService.auth.handler({
        method: 'POST',
        headers: headers as any,
        url: '/organization/invite-member',
        body: {
          organizationId: orgId,
          email: body.email,
          role: body.role ?? 'member',
        },
        query: new URLSearchParams(),
      });

      if (inviteHandler.status >= 200 && inviteHandler.status < 300) {
        return { success: true };
      } else {
        throw new Error('Failed to invite member');
      }
    } catch (error: any) {
      console.error('Invite error:', error);
      throw new HttpException(
        error?.message || 'Failed to invite member',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('revoke')
  async revoke(@Req() req: Request, @Body() body: { userId: string }) {
    const session = await getSessionFromRequest(req, this.authService);
    if (!session?.userId) throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    
    const orgId = session.activeOrganizationId || session.organizationId;
    if (!orgId) throw new HttpException('Organization not selected', HttpStatus.FORBIDDEN);

    // Check that current user is owner
    const me = await prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        userId: session.userId
      }
    });
    
    if (!me || me.role !== 'owner') {
      throw new HttpException('Only owners can revoke', HttpStatus.FORBIDDEN);
    }

    // Prevent revoking yourself
    if (body.userId === session.userId) {
      throw new HttpException('Cannot revoke your own membership', HttpStatus.BAD_REQUEST);
    }

    // Remove membership
    const deleted = await prisma.organizationMember.deleteMany({
      where: {
        organizationId: orgId,
        userId: body.userId
      }
    });

    if (deleted.count === 0) {
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }
}
