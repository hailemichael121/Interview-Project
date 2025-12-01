// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAuth } from '../types/request.types';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const user = request.user;
    const orgContext = request.organizationContext;

    if (!user) {
      return null;
    }

    // Special cases for organization data
    switch (data) {
      case 'organizationId':
        return orgContext?.organizationId || null;
      case 'organization':
        return orgContext?.organization || null;
      case 'memberId':
        return orgContext?.memberId || null;
      case 'memberRole':
        return orgContext?.memberRole || null;
      case 'memberships':
        return user.memberships || [];
      case 'id':
        return user.id;
      case 'email':
        return user.email;
      case 'name':
        return user.name;
      case 'role':
        return user.role;
      case 'tenantId':
        return user.tenantId;
      case 'image':
        return user.image;
      case 'emailVerified':
        return user.emailVerified;
      case 'banned':
        return user.banned;
      case 'createdAt':
        return user.createdAt;
      case 'updatedAt':
        return user.updatedAt;
      default:
        // Return a specific field if requested, otherwise the full user object
        return data ? user[data as keyof typeof user] : user;
    }
  },
);
