import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { BrandEntity } from 'src/brand/entities/brand.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';

export class CreateProductDto {
  @ApiProperty({ default: 'Product Title' })
  @IsNotEmpty({ message: 'Title must be non-empty' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Maximum 255 characters supported for title' })
  title: string;

  @ApiProperty({ default: 'P12345' })
  @IsNotEmpty({ message: 'Product code must be non-empty' })
  @IsString({ message: 'Product code must be a string' })
  @MaxLength(255, {
    message: 'Maximum 255 characters supported for product code',
  })
  productCode: string;

  @ApiProperty({ default: 100.0 })
  @IsNotEmpty({ message: 'Regular price must be non-empty' })
  @IsNumber({}, { message: 'Regular price must be a decimal number' })
  regularPrice: number;

  @ApiPropertyOptional({ default: 80.0 })
  @IsOptional()
  @IsNumber({}, { message: 'Discount price must be a decimal' })
  discountPrice: number;

  @ApiProperty({ default: 10 })
  @IsInt({ message: 'Quantity must be an integer' })
  quantity: number;

  @ApiPropertyOptional({ default: 'This is a product description.' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({ default: 'Key feature 1, Key feature 2' })
  @IsNotEmpty({ message: 'Key features must be non-empty' })
  @IsString({ message: 'Key features must be a string' })
  keyFeatures: string;

  @ApiPropertyOptional({
    default: {
      'Main Features': {
        'Connection Type': 'Wireless',
        'Optical Sensor': 'Darkfield high precision',
        Resolution: '200-8000 DPI',
      },
      'Gaming Features': {
        Button: '6 buttons (Left/Right-click, Back/Forward, etc.)',
        'Scroll Wheel': 'Yes, with auto-shift',
      },
    },
  })
  @IsOptional()
  specifications: Record<string, any>;

  @ApiProperty()
  @IsNotEmpty({ message: 'Category ID must be defined' })
  @IsUUID('all', { message: 'Category must be a valid UUID' })
  category_id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Brand ID must be defined' })
  @IsUUID('all', { message: 'Brand must be a valid UUID' })
  brand_id: string;
}
