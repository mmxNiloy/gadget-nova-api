import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ default: 1 })
  @IsInt({ message: 'Quantity must be an integer' })
  quantity: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product ID must be defined' })
  @IsUUID('all', { message: 'Product must be a valid UUID' })
  product_id: string;
}
