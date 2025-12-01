import { Controller, Get, Session } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('api/auth')
export class AuthController {
  @Get('session')
  @Public()
  getSession(@Session() session: UserSession) {
    return { session };
  }
}
