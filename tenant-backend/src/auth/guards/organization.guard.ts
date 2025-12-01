// src/auth/guards/organization.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithAuth } from '../types/request.types';

@Injectable()
export class OrganizationGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    this.logger.debug(
      `Checking organization context for route: ${context.getHandler().name}`,
    );

    if (!request.organizationContext) {
      this.logger.warn('No organization context found');
      throw new BadRequestException(
        'Organization context is required. Please specify organizationId in X-Organization-Id header, query parameter, or request body.',
      );
    }

    this.logger.debug(
      `Organization context valid: ${request.organizationContext.organizationId}`,
    );
    return true;
  }
}
