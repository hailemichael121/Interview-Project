/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';

const isDev = process.env.NODE_ENV !== 'production';
const isProd = process.env.NODE_ENV === 'production';

function createTransporter(): Transporter | null {
  if (isProd && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.trim(),
      },
    });
  }

  return null;
}

// Initialize transporter
const transporter: Transporter | null = createTransporter();

// Core Email Sending Function
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SentMessageInfo> {
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    'noreply@tenanncy.com';

  const mailOptions: SendMailOptions = {
    from: `"Tenanncy" <${fromEmail}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (isDev) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 Email preview: ${previewUrl}`);
      }
    } else {
      console.log(`✅ Email sent to ${to}`);
    }

    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string,
): Promise<SentMessageInfo> {
  const subject = 'Reset Your Tenanncy Password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #fff; border-radius: 8px; border: 1px solid #eaeaea; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .title { font-size: 20px; font-weight: 600; margin: 0 0 10px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
        .code-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; word-break: break-all; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 14px; text-align: center; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tenanncy</div>
          <h1 class="title">Password Reset</h1>
        </div>
        
        <p>Hello ${userName || 'User'},</p>
        
        <p>You requested to reset your password for your Tenanncy account.</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy this link:</p>
        <div class="code-box">${resetUrl}</div>
        
        <div class="warning">
          <strong>⚠️ This link expires in 1 hour.</strong>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Tenanncy. All rights reserved.</p>
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset - Tenanncy
==========================

Hello ${userName || 'User'},

You requested to reset your password for your Tenanncy account.

Reset your password here: ${resetUrl}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} Tenanncy. All rights reserved.
  `;

  return sendEmail(to, subject, html, text);
}

export async function sendInvitationEmail(
  to: string,
  invitationUrl: string,
  organizationName: string,
  inviterName?: string,
): Promise<SentMessageInfo> {
  const subject = `Join ${organizationName} on Tenanncy`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #fff; border-radius: 8px; border: 1px solid #eaeaea; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .title { font-size: 20px; font-weight: 600; margin: 0 0 10px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
        .info-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #666; font-size: 14px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Tenanncy</div>
          <h1 class="title">Organization Invitation</h1>
        </div>
        
        <p>Hello,</p>
        
        <p>You've been invited to join <strong>${organizationName}</strong> on Tenanncy!</p>
        
        ${inviterName ? `<p><strong>${inviterName}</strong> has invited you to collaborate.</p>` : ''}
        
        <div class="info-box">
          <p><strong>Organization:</strong> ${organizationName}</p>
          <p>Tenanncy helps teams manage tenant relationships and property documentation efficiently.</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${invitationUrl}" class="button">Accept Invitation</a>
        </div>
        
        <p>Or copy this link:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-family: monospace; word-break: break-all; font-size: 14px;">
          ${invitationUrl}
        </div>
        
        <p><small>This invitation expires in 7 days.</small></p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Tenanncy. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Organization Invitation - Tenanncy
===================================

You've been invited to join ${organizationName} on Tenanncy!

${inviterName ? `Invited by: ${inviterName}\n` : ''}
Organization: ${organizationName}

Accept your invitation here: ${invitationUrl}

This invitation expires in 7 days.

© ${new Date().getFullYear()} Tenanncy. All rights reserved.
  `;

  return sendEmail(to, subject, html, text);
}

export default transporter;
