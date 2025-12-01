// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './auth/auth.config';
import { UsersModule } from './users/users.module';
import { OutlinesModule } from './outlines/outlines.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    UsersModule,
    OutlinesModule,
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
