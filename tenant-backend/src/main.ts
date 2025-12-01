// // src/main.ts
// import 'dotenv/config';
// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { AppModule } from './app.module';
// import * as express from 'express';
// import cookieParser from 'cookie-parser';

// async function bootstrap() {
//   console.log('🔧 Environment check:');
//   console.log(
//     '   DATABASE_URL:',
//     process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing',
//   );
//   console.log(
//     '   BETTER_AUTH_SECRET:',
//     process.env.BETTER_AUTH_SECRET ? '✅ Loaded' : '❌ Missing',
//   );
//   console.log(
//     '   BETTER_AUTH_URL:',
//     process.env.BETTER_AUTH_URL ? '✅ Loaded' : '❌ Missing',
//   );
//   console.log(
//     '   FRONTEND_URL:',
//     process.env.FRONTEND_URL ? '✅ Loaded' : '❌ Missing',
//   );
//   console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

//   // Create Nest app
//   const app = await NestFactory.create(AppModule, {
//     bodyParser: false, // we handle body parsing manually
//     logger:
//       process.env.NODE_ENV === 'production'
//         ? ['error', 'warn', 'log']
//         : ['error', 'warn', 'log', 'debug', 'verbose'],
//   });

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true, // strip unknown properties
//       transform: true, // auto-transform payloads
//       forbidNonWhitelisted: true, // throw error for non-whitelisted properties
//       transformOptions: {
//         enableImplicitConversion: true,
//       },
//     }),
//   );

//   // JSON parser
//   app.use(express.json({ limit: '10mb' }));

//   // URL-encoded parser
//   app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//   // Cookie parser (required for Better Auth session)
//   app.use(cookieParser());

//   // CORS configuration
//   const allowedOrigins = [
//     process.env.FRONTEND_URL || 'http://localhost:3001',
//     'http://localhost:3000',
//     'http://localhost:5173', // Vite dev server
//   ].filter(Boolean);

//   console.log('🌐 Allowed CORS origins:', allowedOrigins);

//   app.enableCors({
//     origin: allowedOrigins,
//     credentials: true, // allow cookies
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: [
//       'Content-Type',
//       'Authorization',
//       'Cookie',
//       'X-Organization-Id',
//       'X-Requested-With',
//       'Accept',
//       'Origin',
//     ],
//     exposedHeaders: ['Authorization', 'Set-Cookie', 'X-Organization-Id'],
//   });

//   const port = process.env.PORT ?? 3001;
//   await app.listen(port);

//   console.log('\n🚀 Server running on http://localhost:${port}');
//   console.log('🔐 Auth endpoints:');
//   console.log('   - http://localhost:${port}/api/auth/sign-up');
//   console.log('   - http://localhost:${port}/api/auth/sign-in');
//   console.log('   - http://localhost:${port}/api/auth/session');
//   console.log('\n👤 User endpoints:');
//   console.log('   - http://localhost:${port}/users/profile');
//   console.log('   - http://localhost:${port}/users/me');
//   console.log('\n📝 Outline endpoints:');
//   console.log('   - http://localhost:${port}/api/outlines');
//   console.log('\n👥 Organization endpoints:');
//   console.log('   - http://localhost:${port}/api/organization');
//   console.log('\n📊 API Documentation:');
//   console.log(
//     '   - Add X-Organization-Id header to specify organization context',
//   );
//   console.log('   - Organization switching: POST /api/organization/:id/switch');
//   console.log('\n✅ EnhancedAuthGuard is active');
//   console.log('✅ OrganizationContextMiddleware is active');
//   console.log('✅ PermissionService is active');
// }

// void bootstrap();

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('🔧 Environment check:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

  const isVercel = process.env.VERCEL === '1';

  // Create Nest app
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
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

  // Cookie parser
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

// Export for Vercel
if (process.env.VERCEL) {
  bootstrap();
}

export default bootstrap;
