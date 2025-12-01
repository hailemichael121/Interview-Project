// src/organization/dto/update-organization.dto.ts
import { IsOptional, IsString, Matches, Length } from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @Length(3, 30)
  slug?: string;
}
