import { Injectable, OnModuleInit } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins/organization';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../lib/prisma';

@Injectable()
export class AuthService implements OnModuleInit {
  public readonly auth;

  constructor() {
    console.log('🔐 Initializing Better Auth...');

    // Use the existing Prisma instance directly
    this.auth = betterAuth({
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      plugins: [organization()],
      secret:
        process.env.BETTER_AUTH_SECRET ||
        'fallback-secret-change-in-production',
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3001',
        'http://localhost:3000',
      ],
    });

    console.log('✅ Better Auth initialized');
  }

  async onModuleInit() {
    try {
      await prisma.$connect();
      console.log('✅ Database connected for Auth');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database connection failed:', errorMessage);
      throw error;
    }
  }
}
