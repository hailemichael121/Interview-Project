/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../lib/prisma.service';
import { RequestWithAuth } from '../types/request.types';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OrganizationContextMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: RequestWithAuth, res: Response, next: NextFunction) {
    if (!req.user) {
      this.logger.debug('No user in request, skipping organization context');
      return next();
    }

    let organizationId: string | undefined =
      (req.headers['x-organization-id'] as string) ||
      (req.query.organizationId as string) ||
      req.body?.organizationId;

    this.logger.debug(
      `Organization ID from request: ${organizationId || 'not specified'}`,
    );

    if (!organizationId && req.user.memberships.length > 0) {
      organizationId = req.user.memberships[0].organizationId;
      this.logger.debug(`Using default organization: ${organizationId}`);
    }

    if (req.user && req.user.role?.toUpperCase() === 'OWNER') {
      if (organizationId && req.user.memberships.length === 0) {
        const ownedOrg = await this.prisma.organization.findFirst({
          where: {
            id: organizationId,
            members: {
              some: {
                userId: req.user.id,
                role: 'OWNER' as Role,
                deletedAt: null,
              },
            },
          },
          include: {
            members: {
              where: {
                userId: req.user.id,
                deletedAt: null,
              },
            },
          },
        });

        if (ownedOrg) {
          const membership = ownedOrg.members[0];

          if (membership) {
            const fullMembership =
              await this.prisma.organizationMember.findUnique({
                where: { id: membership.id },
                include: {
                  organization: true,
                },
              });

            if (fullMembership) {
              req.organizationContext = {
                organizationId,
                organization: ownedOrg,
                memberId: fullMembership.id,
                memberRole: fullMembership.role,
                membership: fullMembership,
              };
            }
          } else {
            const newMembership = await this.prisma.organizationMember.create({
              data: {
                organizationId,
                userId: req.user.id,
                role: 'OWNER' as Role,
              },
              include: {
                organization: true,
              },
            });

            req.organizationContext = {
              organizationId,
              organization: ownedOrg,
              memberId: newMembership.id,
              memberRole: newMembership.role,
              membership: newMembership,
            };
          }

          this.logger.debug(
            `Owner context auto-created for organization ${organizationId}`,
          );
          return next();
        }
      }
    }

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
      req.organizationContext = null;
      this.logger.debug('User has no organization memberships');
    } else {
      req.organizationContext = null;
      this.logger.debug('No organization context set');
    }

    next();
  }
}
