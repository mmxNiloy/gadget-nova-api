import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class CreateOrderDto {
  @ApiProperty({ type: [String] })
  @IsNotEmpty({ message: 'Cart IDs must be defined' })
  @IsUUID('all', {
    each: true,
    message: 'Cart IDs must be an array of UUIDs',
  })
  cartIds: string[];

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;
}
