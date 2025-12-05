/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateOutlineDto } from './create-outline.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOutlineDto extends PartialType(CreateOutlineDto) {
  @IsOptional()
  @IsString()
  organizationId?: string;
}
