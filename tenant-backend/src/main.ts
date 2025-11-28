// Load environment variables FIRST
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  // Verify environment variables are loaded
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

  const app = await NestFactory.create(AppModule);

  // Use JSON parser for ALL routes
  app.use(express.json({ limit: '10mb' }));

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
