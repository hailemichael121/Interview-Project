import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeamController],
})
export class TeamModule {}
