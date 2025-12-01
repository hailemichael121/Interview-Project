/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/outlines/guards/outline-roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';

@Injectable()
export class OutlineRolesGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id; // assuming @CurrentUser sets request.user
    const outlineId = request.params.id;

    const outline = await this.prisma.outline.findUnique({
      where: { id: outlineId },
      include: {
        createdBy: true,
        organization: true,
      },
    });

    if (!outline) throw new ForbiddenException('Outline not found');

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId: outline.organizationId,
        deletedAt: null,
      },
    });

    if (!member)
      throw new ForbiddenException('You are not part of this organization');

    // Save these to request for service checks
    request.outline = outline;
    request.member = member;

    return true;
  }
}
