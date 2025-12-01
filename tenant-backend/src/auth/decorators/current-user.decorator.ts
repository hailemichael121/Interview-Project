// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';

interface RequestWithSession extends Request {
  session?: UserSession;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithSession>();
    const session = request.session;

    if (!session?.user) {
      return null;
    }

    // Return a specific field if requested, otherwise the full user object
    return data
      ? session.user[data as keyof typeof session.user]
      : session.user;
  },
);
