// api/index.js - NestJS handler for Vercel
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./../dist/app.module');

let cachedApp;

async function bootstrapServer() {
  if (cachedApp) {
    return cachedApp;
  }

  console.log('🚀 Initializing NestJS app for Vercel...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bodyParser: false, // Important: Disable NestJS body parser for Vercel
  });

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://*.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
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

  // Use Express middleware manually
  const express = require('express');
  const cookieParser = require('cookie-parser');

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  await app.init();

  cachedApp = app;
  console.log('✅ NestJS app initialized for Vercel');
  return app;
}

// Export the serverless function handler
module.exports = async (req, res) => {
  try {
    console.log(`📥 Request: ${req.method} ${req.url}`);
    const app = await bootstrapServer();
    const expressApp = app.getHttpAdapter().getInstance();

    // Handle the request
    expressApp(req, res);
  } catch (error) {
    console.error('❌ Error handling request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
