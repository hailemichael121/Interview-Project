import { Injectable, OnModuleInit } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins/organization';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../lib/prisma';

@Injectable()
export class AuthService implements OnModuleInit {
  public readonly auth;

  constructor() {
    this.auth = betterAuth({
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      plugins: [organization()],
      secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
      baseURL: process.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3000',
      trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3001'],
    });
  }

  async onModuleInit() {
    // Ensure Prisma is connected
    await prisma.$connect();
  }
}
