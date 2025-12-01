// src/outlines/outlines.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OutlinesService } from './outlines.service';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { UpdateOutlineDto } from './dto/update-outline.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnhancedAuthGuard } from '../auth/guards/enhanced-auth.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Role } from '../users/enums/role.enum';

@Controller('api/outlines')
@UseGuards(EnhancedAuthGuard, OrganizationGuard)
export class OutlinesController {
  constructor(private readonly outlinesService: OutlinesService) {}

  // Create a new outline
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberId') memberId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @Body() createOutlineDto: CreateOutlineDto,
  ) {
    // Use organizationId from context, override if provided in DTO
    const targetOrganizationId =
      createOutlineDto.organizationId || organizationId;

    if (!targetOrganizationId) {
      throw new BadRequestException(
        'Organization context is required. Please specify organizationId or switch to an organization.',
      );
    }

    return await this.outlinesService.create(
      userId,
      targetOrganizationId,
      memberId,
      memberRole,
      {
        ...createOutlineDto,
        organizationId: targetOrganizationId,
      },
    );
  }

  // List all outlines for the user's organization with optional pagination
  @Get()
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;
    return await this.outlinesService.findAll(
      organizationId,
      pageNum,
      perPageNum,
    );
  }

  // Get a single outline by ID
  @Get(':id')
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    return await this.outlinesService.findOne(organizationId, id);
  }

  // Update an outline (permissions checked in service)
  @Put(':id')
  async update(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberId') memberId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @Param('id') id: string,
    @Body() updateOutlineDto: UpdateOutlineDto,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    return await this.outlinesService.update(
      userId,
      organizationId,
      memberId,
      memberRole,
      id,
      updateOutlineDto,
    );
  }

  // Soft delete an outline (only creator or owner)
  @Delete(':id')
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberId') memberId: string,
    @CurrentUser('memberRole') memberRole: Role,
    @Param('id') id: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    return await this.outlinesService.remove(
      organizationId,
      memberId,
      memberRole,
      id,
    );
  }

  // Get organization statistics
  @Get('organization/stats')
  async getOrganizationStats(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    return await this.outlinesService.getOrganizationStats(organizationId);
  }

  // NEW: Get outlines assigned to current user as reviewer
  @Get('reviewer/assigned')
  async getAssignedOutlines(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberId') memberId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;
    return await this.outlinesService.getAssignedOutlines(
      organizationId,
      memberId,
      pageNum,
      perPageNum,
    );
  }

  // NEW: Get outlines created by current user
  @Get('creator/my-outlines')
  async getMyOutlines(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('memberId') memberId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'Organization context is required. Please switch to an organization.',
      );
    }

    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;
    return await this.outlinesService.getMyOutlines(
      organizationId,
      memberId,
      pageNum,
      perPageNum,
    );
  }
}
