import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';

const isDev = process.env.NODE_ENV !== 'production';

// Create transporter immediately (not async)
function createTransporter(): Transporter {
  if (isDev) {
    // For development, create a synchronous transporter that will work once test account is ready
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      // Note: We'll update auth later when test account is ready
      auth: {
        user: 'placeholder',
        pass: 'placeholder',
      },
    });
  }

  // Production: Gmail transporter
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      'Gmail credentials missing. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env',
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
    },
  });
}

// Initialize transporter immediately
let transporter: Transporter = createTransporter();

// For development, update with real test account credentials
if (isDev) {
  (async () => {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`📧 Test email account created: ${testAccount.user}`);

      // Update transporter with real credentials
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('✅ Ethereal email transporter ready');
    } catch (error) {
      console.error('Failed to create test account:', error);
      // Fall back to production config
      try {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || '',
            pass: (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, ''),
          },
        });
      } catch {
        console.error('No email transporter available');
      }
    }
  })();
}

export const sendResetEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SentMessageInfo> => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const from = process.env.GMAIL_USER || 'noreply@tenanncy.com';

  const mailOptions: SendMailOptions = {
    from: `"Tenanncy" <${from}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);

    if (isDev) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Email preview:', previewUrl);
      }
    } else {
      console.log('✅ Email sent. Message ID:', info.messageId);
    }

    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

export default transporter;
