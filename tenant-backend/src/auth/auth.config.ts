import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins/admin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { sendResetEmail } from 'src/lib/nodemailer';

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

    // ✅ Password reset email sending
    sendResetPassword: async ({ user, url, token }, request) => {
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
            .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e9ecef; }
            .header { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #dee2e6; }
            .logo { height: 40px; margin-bottom: 20px; }
            .content { padding: 40px 30px; color: #333; }
            .greeting { font-size: 18px; color: #495057; margin-bottom: 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 25px 0; }
            .url-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 8px; margin: 25px 0; font-family: monospace; word-break: break-all; font-size: 14px; color: #495057; }
            .footer { padding: 25px 30px; background: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center; font-size: 13px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://tenanncy.onrender.com/tenant-logo.png" alt="Tenanncy Logo" class="logo">
              <h1 style="margin:0;color:#1a1a1a;font-weight:700;font-size:24px;">Password Reset</h1>
            </div>
            <div class="content">
              <p class="greeting">Hello ${user.name || 'User'},</p>
              <p>You requested to reset your password for your Tenanncy account.</p>
              <div style="text-align:center;">
                <a href="${url}" class="button">Reset Password</a>
              </div>
              <p>Or copy this link:</p>
              <div class="url-box">${url}</div>
              <p><strong>⚠️ This link expires in 1 hour.</strong></p>
              <p style="color:#6c757d;font-size:14px;">
                If you didn't request this, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tenanncy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textTemplate = `
        Password Reset Request - Tenanncy
        =================================
        
        Hello ${user.name || 'User'},
        You requested to reset your password for your Tenanncy account.
        Reset your password here: ${url}
        This link expires in 1 hour.
        If you didn't request this, please ignore this email.
        © ${new Date().getFullYear()} Tenanncy. All rights reserved.
      `;

      try {
        await sendResetEmail(
          user.email,
          'Reset Your Tenanncy Password',
          htmlTemplate,
          textTemplate,
        );
      } catch (error) {
        console.error('Failed to send password reset email:', error);
      }
    },

    // ✅ FIXED: Proper async function signature
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password reset successful: ${user.email}`);
      // Optional: Add any async logic here (logging, notifications, etc.)
    },

    resetPasswordTokenExpiresIn: 3600,
  },

  plugins: [admin()],
});

console.log('✅ Better Auth configured with password reset');
