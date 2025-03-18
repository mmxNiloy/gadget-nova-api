import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';
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

export class OrderSearchDto extends ApiQueryPaginationBaseDTO {
  @ApiProperty({
    default: 'Shovon',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: OrderStatus}) 
  @IsEnum(OrderStatus, { message: 'Status must be one of the following: active, inactive, pending' })
  @IsOptional()
  status: OrderStatus;
}
