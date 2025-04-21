import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ApiQueryPaginationBaseDTO } from "src/common/dtos/pagination/api-query-pagination-base.dto";

export class CreatePromotionDto {
  @ApiProperty({ default: 'Promotion Title' })
  @IsNotEmpty({ message: 'Title must be non-empty' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Maximum 255 characters supported for title' })
  title: string;

  @ApiProperty({ default: 'Promotion sub title' })
  @IsOptional()
  @IsString({ message: 'Sub title must be a string' })
  @MaxLength(255, { message: 'Maximum 255 characters supported for sub title' })
  subTitle: string;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsNotEmpty({ message: 'Start date must be non-empty' })
  startDate: Date;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsNotEmpty({ message: 'End date must be non-empty' })
  endDate: Date;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  promotionImage: Express.Multer.File;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product ID must be defined' })
  @IsUUID('all', { message: 'Product must be a valid UUID' })
  product_id: string;
}

export class PromotionSearchDto extends ApiQueryPaginationBaseDTO {
  @ApiPropertyOptional({ type: String, format: 'date', description: 'Trending start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ type: String, format: 'date', description: 'Trending end date' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'Product IDs must be an array of UUIDs',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  product_ids: string[];
}
