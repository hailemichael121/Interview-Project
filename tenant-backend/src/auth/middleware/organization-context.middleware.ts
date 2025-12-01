// src/auth/middleware/organization-context.middleware.ts
import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../lib/prisma.service';
import { RequestWithAuth } from '../types/request.types';

@Injectable()
export class OrganizationContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OrganizationContextMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: RequestWithAuth, res: Response, next: NextFunction) {
    // Skip if no user
    if (!req.user) {
      this.logger.debug('No user in request, skipping organization context');
      return next();
    }

    // Get organization from (in order of priority):
    // 1. Header: X-Organization-Id
    // 2. Query param: organizationId
    // 3. Body: organizationId
    // 4. Default: first membership
    let organizationId =
      (req.headers['x-organization-id'] as string) ||
      (req.query.organizationId as string) ||
      req.body?.organizationId;

    this.logger.debug(
      `Organization ID from request: ${organizationId || 'not specified'}`,
    );

    // If no organization specified, use default
    if (!organizationId && req.user.memberships.length > 0) {
      organizationId = req.user.memberships[0].organizationId;
      this.logger.debug(`Using default organization: ${organizationId}`);
    }

    // Validate organization membership
    if (organizationId) {
      const membership = req.user.memberships.find(
        (m) => m.organizationId === organizationId,
      );

      if (!membership) {
        this.logger.warn(
          `User ${req.user.id} not member of organization ${organizationId}`,
        );
        throw new BadRequestException(
          'You are not a member of this organization. Please switch to an organization you belong to.',
        );
      }

      // Set organization context
      req.organizationContext = {
        organizationId,
        organization: membership.organization,
        memberId: membership.id,
        memberRole: membership.role,
        membership,
      };

      this.logger.debug(
        `Organization context set: ${organizationId}, role: ${membership.role}`,
      );
    } else if (req.user.memberships.length === 0) {
      // No memberships - user needs to create/join an organization
      req.organizationContext = null;
      this.logger.debug('User has no organization memberships');
    } else {
      req.organizationContext = null;
      this.logger.debug('No organization context set');
    }

    next();
  }
}
