import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins/admin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL:
    process.env.BETTER_AUTH_URL || 'https://tenant-backend-cz23.onrender.com',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://tenanncy-h9sifrs7k-hailemichael121s-projects.vercel.app',
    'https://tenanncy.vercel.app',
    'https://tenanncy.onrender.com',
  ],

  session: {
    cookie: {
      name: 'better-auth.session_token',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
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
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});

console.log('✅ Better Auth configured');
