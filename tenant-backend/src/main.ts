import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  // Add raw body parser for Better Auth routes
  app.use('/api/auth', express.raw({ type: '*/*' }));
  
  // Add JSON parser for other routes
  app.use(express.json({ limit: '10mb' }));

  // Enable CORS for frontend
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
  console.log(`🚀 Backend server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
