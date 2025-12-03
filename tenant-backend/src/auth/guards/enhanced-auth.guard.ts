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

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const cookieName = 'better-auth.session_token';
    const secureCookieName = '__Secure-better-auth.session_token';

    const cookies = request.cookies as Record<string, string> | undefined;
    const encodedToken = cookies?.[cookieName] || cookies?.[secureCookieName];

    if (!encodedToken) {
      this.logger.warn(
        'No session token found. Available cookies:',
        Object.keys(cookies || {}),
      );
      throw new UnauthorizedException('Authentication required');
    }

    const fullToken = decodeURIComponent(encodedToken);
    const sessionToken = fullToken.split('.')[0];

    this.logger.debug(`Token: ${fullToken.substring(0, 30)}...`);
    this.logger.debug(`Session token: ${sessionToken}`);

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
      this.logger.warn(`Session not found: ${sessionToken}`);
      throw new UnauthorizedException('Invalid session');
    }

    if (session.expiresAt < new Date()) {
      this.logger.warn(`Session expired: ${session.expiresAt.toISOString()}`);
      throw new UnauthorizedException('Session expired');
    }

    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: { organization: true },
      orderBy: { joinedAt: 'desc' },
    });

    const userRole = session.user.role;
    const finalRole = userRole ? userRole.toUpperCase() : 'USER';

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
      role: finalRole,
      tenantId: session.user.tenantId || undefined,
      banned: session.user.banned || false,
      emailVerified: session.user.emailVerified || false,
      image: session.user.image || undefined,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
      memberships: memberships.map((m) => ({
        id: m.id,
        organizationId: m.organizationId,
        userId: m.userId,
        role: m.role,
        organization: m.organization,
        joinedAt: m.joinedAt,
      })),
      defaultMembership: memberships[0] || null,
    };

    request.session = {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
        role: session.user.role || undefined,
        tenantId: session.user.tenantId || undefined,
        banned: session.user.banned || false,
        emailVerified: session.user.emailVerified || false,
        image: session.user.image || undefined,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      },
    };

    this.logger.debug(
      `User: ${session.user.id} (${session.user.email}) with ${memberships.length} memberships`,
    );

    return true;
  }
}
