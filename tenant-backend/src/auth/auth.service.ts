import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins/organization';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
  public readonly auth;

  constructor() {
    const prisma = new PrismaClient();

    this.auth = betterAuth({
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      plugins: [organization()],
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    });
  }
}
