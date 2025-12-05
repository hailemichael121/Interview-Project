/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins/admin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { sendPasswordResetEmail, sendInvitationEmail } from '../lib/nodemailer';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const getBaseUrl = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://tenant-backend-cz23.onrender.com';
  }
  return 'http://localhost:3000';
};

// Better Auth Configuration
export const auth = betterAuth({
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  baseURL: getBaseUrl(),
  basePath: '/api/auth',

  secret:
    process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',

  // CORS origins
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://tenanncy-h9sifrs7k-hailemichael121s-projects.vercel.app',
    'https://tenanncy.vercel.app',
    'https://tenanncy.onrender.com',
    'https://tenant-backend-cz23.onrender.com',
  ],

  // Session Configuration
  session: {
    cookie: {
      name: 'better-auth.session_token',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    expiresIn: 60 * 60 * 24 * 7,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'USER',
        transformInput: (value?: string) => {
          if (!value) return 'USER';
          const upperValue = value.toUpperCase();
          if (
            ['ADMIN', 'OWNER', 'REVIEWER', 'MEMBER', 'USER'].includes(
              upperValue,
            )
          ) {
            return upperValue;
          }
          return 'USER';
        },
      },
      tenantId: {
        type: 'string',
        required: false,
      },
    },
  },

  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      try {
        const resetUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;

        await sendPasswordResetEmail(user.email, user.name || 'User', resetUrl);
      } catch {
        // Don't throw error - let Better Auth handle it
      }
    },

    onPasswordReset: async () => {
      return Promise.resolve();
    },

    onChangePassword: async () => {
      return Promise.resolve();
    },

    resetPasswordTokenExpiresIn: 3600,
    requireEmailVerification: false,
  },

  plugins: [admin()],

  rateLimit: {
    window: 60 * 1000,
    max: 60,
  },
});

console.log('✅ Better Auth configured with password reset support');

export async function sendOrganizationInvitation(
  email: string,
  organizationName: string,
  token: string,
  inviterName?: string,
) {
  try {
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://tenanncy.vercel.app';
    const invitationUrl = `${frontendUrl}/api/organization/accept-invite/${token}`;

    await sendInvitationEmail(
      email,
      invitationUrl,
      organizationName,
      inviterName,
    );

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
