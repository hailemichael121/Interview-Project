import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OutlinesModule } from './outlines/outlines.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [AuthModule, OutlinesModule, TeamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
