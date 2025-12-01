// src/auth/guards/enhanced-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../lib/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestWithAuth } from '../types/request.types';

@Injectable()
export class EnhancedAuthGuard implements CanActivate {
  private readonly logger = new Logger(EnhancedAuthGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Public route accessed');
      return true;
    }

    // Get session token from cookie
    const sessionToken = request.cookies?.['better-auth.session_token'];
    
    if (!sessionToken) {
      this.logger.warn('No session token found in cookies');
      throw new UnauthorizedException('Authentication required');
    }

    this.logger.debug(`Session token found: ${sessionToken.substring(0, 20)}...`);

    // Find session in database
    const session = await this.prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
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
        },
      },
    });

    if (!session) {
      this.logger.warn('Invalid session token');
      throw new UnauthorizedException('Invalid session');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.logger.warn('Session expired');
      throw new UnauthorizedException('Session expired');
    }

    // Get ALL organization memberships for user
    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        organization: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    // Normalize role to uppercase and handle null/undefined
    const userRole = session.user.role;
    const finalRole = userRole ? userRole.toUpperCase() : 'USER';

    // Handle null values for ExtendedUser type
    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined, // Convert null to undefined
      role: finalRole,
      tenantId: session.user.tenantId || undefined,
      banned: session.user.banned || false, // Convert null to false
      emailVerified: session.user.emailVerified || false, // Convert null to false
      image: session.user.image || undefined, // Convert null to undefined
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
      memberships: memberships.map(m => ({
        id: m.id,
        organizationId: m.organizationId,
        userId: m.userId,
        role: m.role,
        organization: m.organization,
        joinedAt: m.joinedAt,
      })),
      defaultMembership: memberships[0] || null,
    };

    // Also store the session for compatibility
    request.session = {
      user: {
        ...session.user,
        name: session.user.name || undefined,
        role: session.user.role || undefined,
        tenantId: session.user.tenantId || undefined,
        banned: session.user.banned || false,
        emailVerified: session.user.emailVerified || false,
        image: session.user.image || undefined,
      },
    };

    this.logger.debug(
      `Authenticated user: ${session.user.id} (${session.user.email}) with ${memberships.length} organization memberships`,
    );

    return true;
  }
}