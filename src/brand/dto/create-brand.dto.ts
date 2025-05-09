import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';

export class CreateBrandDto {
  @ApiProperty({ default: 'ViweSonic' })
  @IsNotEmpty({ message: 'Brand name be non empty' })
  @IsString({ message: 'Brand name Must be a string' })
  name: string;

  @ApiProperty({default: "Dell_ins_15_3520"})
  @IsNotEmpty({ message: 'Slug be non empty' })
  @IsString({ message: 'Slug Must be a string' })
  slug: string;

  @ApiProperty({default: "Monitor"})
  @IsNotEmpty({ message: 'Meta title be non empty' })
  @IsString({ message: 'Meta title Must be a string' })
  metaTitle: string;

  @ApiProperty({default: "Monitor"})
  @IsOptional()
  @IsString({ message: 'Category name Must be a string' })
  metaDescription: string;

  @ApiProperty({ type: [String] })
  @IsNotEmpty({ message: 'Category IDs must be defined' })
  @IsUUID('all', {
    each: true,
    message: 'Category IDs must be an array of UUIDs',
  })
  category_ids: string[];
}

export class BrandSearchDto extends ApiQueryPaginationBaseDTO {
  @ApiProperty({
    default: 'Logitech',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'Category IDs must be an array of UUIDs',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  category_ids: string[];
}