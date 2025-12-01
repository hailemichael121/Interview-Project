import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { SectionType, Status } from '@prisma/client';

export class CreateOutlineDto {
  @IsString()
  header: string;

  @IsEnum(SectionType)
  sectionType: SectionType;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsNumber()
  @Min(0)
  target?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;

  @IsOptional()
  @IsString()
  reviewerId?: string;
}
