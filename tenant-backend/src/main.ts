/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import cookieParser from 'cookie-parser'; // Use default import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookies (required for Better Auth)
  app.use(cookieParser()); // Now it should work

  // Rest of your CORS and server setup...
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://tenanncy-h9sifrs7k-hailemichael121s-projects.vercel.app',
    'https://tenanncy.vercel.app',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // ✅ This is CRITICAL for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Organization-Id',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Credentials', // Add this
    ],
    exposedHeaders: [
      'Authorization',
      'Set-Cookie',
      'X-Organization-Id',
      'Access-Control-Allow-Credentials',
    ],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log('🌐 Allowed Origins:', allowedOrigins);
}

bootstrap();
