import { PartialType } from '@nestjs/mapped-types';
import { CreateOutlineDto } from './create-outline.dto';

export class UpdateOutlineDto extends PartialType(CreateOutlineDto) {}
