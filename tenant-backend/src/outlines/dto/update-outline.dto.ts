/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/outlines/dto/update-outline.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOutlineDto } from './create-outline.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateOutlineDto extends PartialType(CreateOutlineDto) {
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
