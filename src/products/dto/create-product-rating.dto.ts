import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max
} from 'class-validator';

export class CreateProductRatingsDto {
  @ApiPropertyOptional({ default: 'This is so good' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({ default: 5 })
  @IsInt({ message: 'Star count must be an integer' })
  @Max(5, {message:"Star count can be maximum of 5"})
  star_count: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product ID must be defined' })
  @IsUUID('all', { message: 'Product must be a valid UUID' })
  product_id: string;
}
