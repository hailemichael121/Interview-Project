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
} from '@nestjs/common';
import { OutlinesService } from './outlines.service';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { UpdateOutlineDto } from './dto/update-outline.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OutlineRolesGuard } from './guards/outline-roles.guard';

@Controller('api/outlines')
export class OutlinesController {
  constructor(private readonly outlinesService: OutlinesService) {}

  // Create a new outline
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createOutlineDto: CreateOutlineDto,
  ) {
    return await this.outlinesService.create(userId, createOutlineDto);
  }

  // List all outlines for the user's organization with optional pagination
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;
    return await this.outlinesService.findAll(userId, pageNum, perPageNum);
  }

  // Get a single outline by ID
  @Get(':id')
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.outlinesService.findOne(userId, id);
  }

  // Update an outline (role-based access)
  @Put(':id')
  @UseGuards(OutlineRolesGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateOutlineDto: UpdateOutlineDto,
  ) {
    return await this.outlinesService.update(userId, id, updateOutlineDto);
  }

  // Soft delete an outline (only creator or owner)
  @Delete(':id')
  @UseGuards(OutlineRolesGuard)
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return await this.outlinesService.remove(userId, id);
  }
}
