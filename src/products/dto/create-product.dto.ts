import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';
import { Bool } from 'src/common/enums/bool.enum';

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
  @IsOptional()
  @IsInt({ message: 'stock amount Quantity must be an integer' })
  stockAmount: number;

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
    description: 'Product specifications in HTML format',
    example: `<h3>Main Features</h3>
              <ul>
                <li><strong>Connection Type:</strong> Wireless</li>
                <li><strong>Optical Sensor:</strong> Darkfield high precision</li>
                <li><strong>Resolution:</strong> 200-8000 DPI</li>
              </ul>
              <h3>Gaming Features</h3>
              <ul>
                <li><strong>Button:</strong> 6 buttons (Left/Right-click, Back/Forward, etc.)</li>
                <li><strong>Scroll Wheel:</strong> Yes, with auto-shift</li>
              </ul>`,
  })
  @IsOptional()
  @IsString()
  specifications: string;

  @ApiProperty({ default: 3 })
  @IsInt({ message: 'Threshold Amount must be an integer' })
  @IsOptional()
  thresholdAMount: number;

  // @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    console.log('Is Trending', { value, type: typeof value });
    return value === 'true';
  })
  isTrending: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isFeatured: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isBestSeller: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isInStock: boolean;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  trendingStartDate: Date;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  trendingEndDate: Date;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  featuredStartDate: Date;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  featuredEndDate: Date;

  @ApiProperty()
  @IsNotEmpty({ message: 'Category ID must be defined' })
  @IsUUID('all', { message: 'Category must be a valid UUID' })
  category_id: string;

  @ApiPropertyOptional({ description: 'Subcategory ID (if applicable)' })
  @IsOptional()
  @IsUUID('all', { message: 'Subcategory must be a valid UUID' })
  subcategory_id?: string;

  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',');
    return [];
  })
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
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

  @ApiPropertyOptional({ type: String, description: 'Parent category slug' })
  @IsOptional()
  category: string; // Parent category Slug

  @ApiPropertyOptional({ type: [String], description: 'Subcategory slugs' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  subcategories: string[];

  @ApiPropertyOptional({ type: [String], description: 'Brand slugs' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  brands: string[];

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

  @ApiPropertyOptional({ enum: Bool, description: 'Filter trending products' })
  @IsOptional()
  @IsEnum(Bool)
  @Transform(({ value }) => (value === '1' || value === 1 ? Bool.YES : Bool.NO))
  isTrending?: Bool;

  @ApiPropertyOptional({ enum: Bool, description: 'Filter featured products' })
  @IsOptional()
  @IsEnum(Bool)
  @Transform(({ value }) => (value === '1' || value === 1 ? Bool.YES : Bool.NO))
  isFeatured?: Bool;

  @ApiPropertyOptional({ enum: Bool, description: 'Filter featured products' })
  @IsOptional()
  @IsEnum(Bool)
  @Transform(({ value }) => (value === '1' || value === 1 ? Bool.YES : Bool.NO))
  isBestSeller?: Bool;

  @ApiPropertyOptional({ enum: Bool, description: 'Filter in-stock products' })
  @IsOptional()
  @IsEnum(Bool)
  @Transform(({ value }) => (value === '1' || value === 1 ? Bool.YES : Bool.NO))
  isInStock?: Bool;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Trending start date',
  })
  @IsOptional()
  @IsString()
  trendingStartDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Trending end date',
  })
  @IsOptional()
  @IsString()
  trendingEndDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Featured start date',
  })
  @IsOptional()
  @IsString()
  featuredStartDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Featured end date',
  })
  @IsOptional()
  @IsString()
  featuredEndDate?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum price filter',
    example: 1000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Min price must be a number' })
  minPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum price filter',
    example: 50000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max price must be a number' })
  maxPrice?: number;
}
