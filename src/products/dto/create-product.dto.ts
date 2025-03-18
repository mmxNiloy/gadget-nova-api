import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength
} from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';

export class CreateProductDto {
  @ApiProperty({ default: 'Product Title' })
  @IsNotEmpty({ message: 'Title must be non-empty' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Maximum 255 characters supported for title' })
  title: string;

  @ApiProperty({ default: 'Dell_ins_15_3520' })
  @IsNotEmpty({ message: 'Slug be non empty' })
  @IsString({ message: 'Slug Must be a string' })
  slug: string;

  @ApiProperty({ default: 'Monitor' })
  @IsNotEmpty({ message: 'Meta title be non empty' })
  @IsString({ message: 'Meta title Must be a string' })
  metaTitle: string;

  @ApiProperty({ default: 'Monitor' })
  @IsOptional()
  @IsString({ message: 'Category name Must be a string' })
  metaDescription: string;

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

  @ApiProperty({ default: 3 })
  @IsInt({ message: 'Threshold Amount must be an integer' })
  @IsOptional()
  thresholdAMount: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Category ID must be defined' })
  @IsUUID('all', { message: 'Category must be a valid UUID' })
  category_id: string;

  @ApiProperty({ type: [String] })
  @IsNotEmpty({ message: 'attribute value IDs must be defined' })
  @IsUUID('all', {
    each: true,
    message: 'attribute value IDs must be an array of UUIDs',
  })
  attribute_value_ids: string[];

  @ApiProperty()
  @IsNotEmpty({ message: 'Brand ID must be defined' })
  @IsUUID('all', { message: 'Brand must be a valid UUID' })
  brand_id: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  thumbnail: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Gallery of images',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Gallery should contain at least one image' })
  gallery: Express.Multer.File[];
}

export class ProductSearchDto extends ApiQueryPaginationBaseDTO {
  @ApiProperty({
    default: 'Product title',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  title: string;
  
  @ApiProperty({
    default: 'P12345',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  productCode: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'Category IDs must be an array of UUIDs',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  category_ids: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'Brand IDs must be an array of UUIDs',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  brand_ids: string[];
}
