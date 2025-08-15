import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max
} from 'class-validator';

export class CreateProductRatingsSlugDto {
  @ApiPropertyOptional({ default: 'This is so good' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({ default: 5 })
  @IsInt({ message: 'Star count must be an integer' })
  @Max(5, {message:"Star count can be maximum of 5"})
  star_count: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product slug must be defined' })
  @IsString({ message: 'Product slug must be a string' })
  slug: string;
} 