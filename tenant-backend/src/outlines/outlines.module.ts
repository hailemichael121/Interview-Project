// src/outlines/outlines.module.ts
import { Module } from '@nestjs/common';
import { OutlinesController } from './outlines.controller';
import { OutlinesService } from './outlines.service';
import { PrismaService } from '../lib/prisma.service';

@Module({
  controllers: [OutlinesController],
  providers: [OutlinesService, PrismaService],
  exports: [OutlinesService],
})
export class OutlinesModule {}
