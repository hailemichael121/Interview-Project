// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnhancedAuthGuard } from './auth/guards/enhanced-auth.guard';
import { OrganizationContextMiddleware } from './auth/middleware/organization-context.middleware';
import { PermissionService } from './auth/services/permission.service';
import { PrismaModule } from './lib/prisma.module';
import { OrganizationModule } from './organization/organization.module';
import { OutlinesModule } from './outlines/outlines.module';
import { UsersModule } from './users/users.module';
import { auth } from './auth/auth.config';

@Module({
  imports: [
    PrismaModule,
    AuthModule.forRoot({ auth }),
    UsersModule,
    OutlinesModule,
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PermissionService,
    EnhancedAuthGuard,
    {
      provide: APP_GUARD,
      useClass: EnhancedAuthGuard, // Use enhanced guard globally
    },
  ],
  exports: [PermissionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply OrganizationContextMiddleware to ALL routes
    consumer.apply(OrganizationContextMiddleware).forRoutes('*');
  }
}
