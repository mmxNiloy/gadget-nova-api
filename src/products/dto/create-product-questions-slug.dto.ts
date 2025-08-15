import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateProductQuestionsSlugDto {
  @ApiPropertyOptional({ default: 'Can it be discounted?.' })
  @IsOptional()
  @IsString({ message: 'Question must be a string' })
  question: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product slug must be defined' })
  @IsString({ message: 'Product slug must be a string' })
  slug: string;
} 