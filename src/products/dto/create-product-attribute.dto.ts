import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';

export class CreateProductAttributeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Attribute value ID must be defined' })
  @IsUUID('all', { message: 'Attribute value must be a valid UUID' })
  attributeValue_id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product ID must be defined' })
  @IsUUID('all', { message: 'Product ID must be a valid UUID' })
  product_id: string;
}

export class AttributeSearchDto extends ApiQueryPaginationBaseDTO {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('all', {
    each: true,
    message: 'Product IDs must be an array of UUIDs',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  product_ids: string[];
}
