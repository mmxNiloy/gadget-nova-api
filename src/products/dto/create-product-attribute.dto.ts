import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

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
