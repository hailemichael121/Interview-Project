// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import cookieParser from 'cookie-parser'; // ✅ ESM-compatible import

async function bootstrap() {
  console.log('🔧 Environment check:');
  console.log(
    '   DATABASE_URL:',
    process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing',
  );
  console.log(
    '   BETTER_AUTH_SECRET:',
    process.env.BETTER_AUTH_SECRET ? '✅ Loaded' : '❌ Missing',
  );
  console.log(
    '   BETTER_AUTH_URL:',
    process.env.BETTER_AUTH_URL ? '✅ Loaded' : '❌ Missing',
  );
  console.log(
    '   FRONTEND_URL:',
    process.env.FRONTEND_URL ? '✅ Loaded' : '❌ Missing',
  );

  // Create Nest app
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // we handle body parsing manually
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      transform: true, // auto-transform payloads
    }),
  );

  // JSON parser
  app.use(express.json({ limit: '10mb' }));

  // Cookie parser (required for Better Auth session)
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'http://localhost:3000',
    ],
    credentials: true, // ✅ allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🔐 Auth: http://localhost:${port}/api/auth`);
  console.log(`👤 Users: http://localhost:${port}/users`);
  console.log(`📝 Outlines: http://localhost:${port}/api/outlines`);
  console.log(`👥 Team: http://localhost:${port}/api/team`);
}

void bootstrap();
