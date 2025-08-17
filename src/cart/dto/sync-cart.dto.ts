import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    description: 'Product ID to add to the cart',
    example: '74151247-9970-45ea-a3ec-59065c76f9de',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class SyncCartDto {
  @ApiProperty({
    description: 'List of cart items to sync',
    type: [CreateCartDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartDto)
  items: CreateCartDto[];
}
