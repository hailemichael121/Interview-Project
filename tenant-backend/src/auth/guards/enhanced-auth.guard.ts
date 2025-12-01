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

    const session = request.session;

    // 1. Check authentication
    if (!session?.user) {
      this.logger.warn('No session or user found');
      throw new UnauthorizedException('Authentication required');
    }

    this.logger.debug(
      `Authenticated user: ${session.user.id} (${session.user.email})`,
    );

    // 2. Get ALL organization memberships for user
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

    // 3. Store in request for easy access - Handle string[] role and null values
    const userRole = session.user.role;
    const finalRole = Array.isArray(userRole)
      ? userRole[0] || undefined // Take first if array, or undefined
      : userRole || undefined; // Use as-is or undefined

    // Handle null values for image and other fields
    const userImage = session.user.image;
    const finalImage = userImage === null ? undefined : userImage;

    request.user = {
      ...session.user,
      role: finalRole, // string | undefined
      image: finalImage, // Convert null to undefined
      memberships,
      defaultMembership: memberships[0] || null,
    };

    this.logger.debug(
      `User ${session.user.id} has ${memberships.length} organization memberships`,
    );

    return true;
  }
}
