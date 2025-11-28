import { Module } from '@nestjs/common';
import { OutlinesService } from './outlines.service';
import { OutlinesController } from './outlines.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [OutlinesService],
  controllers: [OutlinesController],
  exports: [OutlinesService],
})
export class OutlinesModule {}
