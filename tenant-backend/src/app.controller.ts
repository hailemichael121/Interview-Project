// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator'; // Add this

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public() // ← Add this decorator
  getHello(): { message: string; timestamp: string } {
    console.log('🌐 Root endpoint called');
    return {
      message: this.appService.getHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
