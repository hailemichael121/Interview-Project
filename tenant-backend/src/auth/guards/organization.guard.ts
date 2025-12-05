/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { RequestWithAuth } from '../types/request.types';

@Injectable()
export class OrganizationGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const handlerName = context.getHandler().name;

    this.logger.debug(
      `Checking organization context for route: ${handlerName}`,
    );

    if (request.organizationContext) {
      this.logger.debug(
        `Organization context exists: ${request.organizationContext.organizationId}`,
      );
      return true;
    }

    const organizationIdFromHeader = request.headers[
      'x-organization-id'
    ] as string;

    const organizationIdFromParams = request.params.id;

    const orgIdFromParams =
      request.params.organizationId || request.params.orgId;

    const finalOrganizationId =
      organizationIdFromHeader || organizationIdFromParams || orgIdFromParams;

    if (finalOrganizationId && request.user?.memberships) {
      const membership = request.user.memberships.find(
        (m) => m.organizationId === finalOrganizationId,
      );

      if (membership) {
        request.organizationContext = {
          organizationId: finalOrganizationId,
          organization: membership.organization,
          memberId: membership.id,
          memberRole: membership.role,
          membership,
        };

        this.logger.debug(
          `Auto-set organization context: ${finalOrganizationId}`,
        );
        return true;
      } else {
        this.logger.warn(
          `User ${request.user.id} not member of organization ${finalOrganizationId}`,
        );
        throw new BadRequestException(
          'You are not a member of this organization. Please switch to an organization you belong to.',
        );
      }
    }

    const organizationIdFromQuery = request.query.organizationId as string;
    if (organizationIdFromQuery && request.user?.memberships) {
      const membership = request.user.memberships.find(
        (m) => m.organizationId === organizationIdFromQuery,
      );

      if (membership) {
        request.organizationContext = {
          organizationId: organizationIdFromQuery,
          organization: membership.organization,
          memberId: membership.id,
          memberRole: membership.role,
          membership,
        };

        this.logger.debug(
          `Auto-set organization context from query: ${organizationIdFromQuery}`,
        );
        return true;
      }
    }

    const organizationIdFromBody = request.body?.organizationId;
    if (organizationIdFromBody && request.user?.memberships) {
      const membership = request.user.memberships.find(
        (m) => m.organizationId === organizationIdFromBody,
      );

      if (membership) {
        request.organizationContext = {
          organizationId: organizationIdFromBody,
          organization: membership.organization,
          memberId: membership.id,
          memberRole: membership.role,
          membership,
        };

        this.logger.debug(
          `Auto-set organization context from body: ${organizationIdFromBody}`,
        );
        return true;
      }
    }

    this.logger.warn('No organization context found');
    throw new BadRequestException(
      'Organization context is required. Please specify organizationId in X-Organization-Id header, query parameter, or request body.',
    );
  }
}
