// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('🔧 Environment check:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('   VERCEL:', process.env.VERCEL || 'Not on Vercel');

  const isVercel = process.env.VERCEL === '1';

  // Create Nest app
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // We handle body parsing manually
    logger: isVercel
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // JSON parser
  app.use(express.json({ limit: '10mb' }));

  // URL-encoded parser
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser (required for Better Auth session)
  app.use(cookieParser());

  // CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173',
    ...(isVercel ? ['https://*.vercel.app'] : []),
  ].filter(Boolean);

  console.log('🌐 Allowed CORS origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Organization-Id',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Authorization', 'Set-Cookie', 'X-Organization-Id'],
  });

  if (!isVercel) {
    // Local development - listen on port
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`\n🚀 Server running on http://localhost:${port}`);
  } else {
    // Vercel serverless - initialize only
    await app.init();
    console.log('✅ NestJS app initialized for Vercel');
  }
}

// Run locally if not on Vercel
if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

// Export for local development
export { bootstrap };
