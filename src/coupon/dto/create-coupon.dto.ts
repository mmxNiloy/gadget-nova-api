import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CouponTypeEnum } from 'src/common/enums/coupon-type.enum';
import { CouponUsageTypeEnum } from 'src/common/enums/coupon-usage-type.enum';

export class CreateCouponDto {
  @ApiProperty({ description: 'Unique coupon code', example: 'WELCOME50' })
  @IsNotEmpty({ message: 'Coupon code is required' })
  @IsString({ message: 'Coupon code must be a string' })
  @MaxLength(50, { message: 'Coupon code cannot exceed 50 characters' })
  couponCode: string;

  @ApiPropertyOptional({ description: 'Coupon description', example: 'Get 50% off on your first order' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({ enum: CouponTypeEnum}) 
  @IsEnum(CouponTypeEnum, { message: 'Coupon type must be one of the following: PERCENTAGE, FLAT, FREE_DELIVERY' })
  @IsNotEmpty({ message: 'Coupon type must be provided' })
  couponType: CouponTypeEnum;

  @ApiProperty({ description: 'Coupon value (percentage or flat amount)', example: 50 })
  @IsNumber({}, { message: 'couponValue must be a number' })
  @Min(0, { message: 'couponValue cannot be negative' })
  couponValue: number;

  @ApiPropertyOptional({ description: 'Maximum discount limit for percentage coupons', example: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'maximumDiscountLimit must be a number' })
  @Min(0, { message: 'maximumDiscountLimit cannot be negative' })
  maximumDiscountLimit?: number;

  @ApiProperty({ description: 'Minimum order amount required', example: 500 })
  @IsNumber({}, { message: 'minimumOrderAmount must be a number' })
  @Min(0, { message: 'minimumOrderAmount cannot be negative' })
  minimumOrderAmount: number;

  @ApiProperty({ description: 'Start date for coupon validity', example: '2024-01-01T00:00:00Z' })
  @IsDateString({}, { message: 'startDate must be a valid date string' })
  startDate: string;

  @ApiProperty({ description: 'End date for coupon validity', example: '2024-12-31T23:59:59Z' })
  @IsDateString({}, { message: 'endDate must be a valid date string' })
  endDate: string;

  @ApiProperty({ description: 'Usage limit per user', example: 1 })
  @IsInt({ message: 'usageLimitPerUser must be an integer' })
  @Min(1, { message: 'usageLimitPerUser must be at least 1' })
  @Max(100, { message: 'usageLimitPerUser cannot exceed 100' })
  usageLimitPerUser: number;

  @ApiPropertyOptional({ description: 'Array of product IDs', type: [String] })
  @IsOptional()
  @IsArray({ message: 'applicableProductIds must be an array' })
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  applicableProductIds?: string[];

  @ApiPropertyOptional({ description: 'Array of category IDs', type: [String] })
  @IsOptional()
  @IsArray({ message: 'applicableCategoryIds must be an array' })
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  applicableCategoryIds?: string[];

  @ApiPropertyOptional({ description: 'Array of sub-category IDs', type: [String] })
  @IsOptional()
  @IsArray({ message: 'applicableSubCategoryIds must be an array' })
  @IsUUID('4', { each: true, message: 'Each sub-category ID must be a valid UUID' })
  applicableSubCategoryIds?: string[];

  @ApiPropertyOptional({ description: 'Array of brand IDs', type: [String] })
  @IsOptional()
  @IsArray({ message: 'applicableBrandIds must be an array' })
  @IsUUID('4', { each: true, message: 'Each brand ID must be a valid UUID' })
  applicableBrandIds?: string[];

  @ApiPropertyOptional({ enum: CouponUsageTypeEnum}) 
  @IsEnum(CouponUsageTypeEnum, { message: 'Coupon usage type must be one of the following: SINGLE_USAGE, MULTI_USAGE, First_ORDER' })
  @IsNotEmpty({ message: 'Coupon usage type must be provided' })
  couponUsageType: CouponUsageTypeEnum;
} 