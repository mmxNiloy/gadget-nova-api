import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';

export class CreateCategoryDto {
  @ApiProperty({default: "Monitor"})
  @IsNotEmpty({ message: 'Category name be non empty' })
  @IsString({ message: 'Category name Must be a string' })
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

  @ApiProperty()
  @IsOptional()
  @IsUUID('all', { message: 'Brand must be a valid UUID' })
  parent_category_id?: string;
}

export class CategorySearchDto extends ApiQueryPaginationBaseDTO {
  @ApiProperty({
    default: 'Monitor',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;
}
