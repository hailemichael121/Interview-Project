import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins/admin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Import email functions
import { sendPasswordResetEmail, sendInvitationEmail } from '../lib/nodemailer';

// ------------------------------------------------------------
// Database Configuration
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Better Auth Configuration
// ------------------------------------------------------------
export const auth = betterAuth({
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Base URL configuration
  baseURL: process.env.BETTER_AUTH_URL || 'https://your-app.onrender.com',
  basePath: '/api/auth',

  // Security
  secret:
    process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',

  // CORS origins
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://your-app.vercel.app',
    'https://your-app.onrender.com',
  ],

  // ------------------------------------------------------------
  // Session Configuration
  // ------------------------------------------------------------
  session: {
    cookie: {
      name: 'better-auth.session_token',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  // ------------------------------------------------------------
  // User Schema
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Email & Password Authentication
  // ------------------------------------------------------------
  emailAndPassword: {
    enabled: true,

    // 🔐 Password Reset Configuration
    sendResetPassword: async ({ user, url }) => {
      try {
        console.log(`📧 Sending password reset email to: ${user.email}`);

        await sendPasswordResetEmail(user.email, user.name || 'User', url);

        console.log(`✅ Password reset email sent to: ${user.email}`);
      } catch (error) {
        console.error('❌ Failed to send password reset email:', error);
      }
    },

    // 🔄 Password Reset Completion Hook
    onPasswordReset: async ({ user }) => {
      console.log(`✅ Password reset completed for user: ${user.email}`);
    },

    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },

  // ------------------------------------------------------------
  // Plugins
  // ------------------------------------------------------------
  plugins: [
    admin(), // Admin dashboard for user management
  ],
});

console.log('✅ Better Auth configured with password reset support');

// ------------------------------------------------------------
// Optional: Helper function for sending invitation emails
// ------------------------------------------------------------
export async function sendOrganizationInvitation(
  email: string,
  organizationName: string,
  token: string,
  inviterName?: string,
) {
  try {
    // Construct invitation URL
    const invitationUrl = `${process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL}/accept-invite/${token}`;

    console.log(`📧 Sending organization invitation to: ${email}`);

    await sendInvitationEmail(
      email,
      invitationUrl,
      organizationName,
      inviterName,
    );

    console.log(`✅ Invitation sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    return { success: false, error };
  }
}
