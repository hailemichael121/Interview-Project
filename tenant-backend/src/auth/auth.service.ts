import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins/organization';
import { prismaAdapter } from 'better-auth/adapters/prisma';

@Injectable()
export class AuthService {
  public readonly auth;

  constructor() {
    try {
      // Dynamically import PrismaClient to avoid issues
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      this.auth = betterAuth({
        database: prismaAdapter(prisma, {
          provider: 'postgresql',
        }),
        emailAndPassword: {
          enabled: true,
        },
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scope: ['openid', 'email', 'profile']
          },
          github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            scope: ['user:email']
          },
        },
        plugins: [organization()],
        trustHost: true,
        secret: process.env.BETTER_AUTH_SECRET!,
        baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      });
    } catch (error) {
      console.error('Failed to initialize Better Auth:', error);
      throw error;
    }
  }
}