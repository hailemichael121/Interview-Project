import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string; timestamp: string } {
    console.log('🌐 Root endpoint called');
    return {
      message: this.appService.getHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
