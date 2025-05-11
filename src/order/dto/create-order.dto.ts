import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { CreateShippingInfoDto } from '../../shipping-info/dto/create-shipping-info.dto';
import { PaymentMethodEnum } from 'src/common/enums/payment-method.enum';

export class CreateOrderDto {
  // @ApiProperty({ type: [String] })
  // @IsNotEmpty({ message: 'Cart IDs must be defined' })
  // @IsUUID('all', {
  //   each: true,
  //   message: 'Cart IDs must be an array of UUIDs',
  // })
  // cartIds: string[];

  @ApiProperty({
    type: () => CreateShippingInfoDto,
    description: 'Shipping information for the order',
  })
  @ValidateNested()
  @Type(() => CreateShippingInfoDto)
  @IsNotEmpty({ message: 'Shipping info must be provided' })
  shippingInfo: CreateShippingInfoDto;

  @ApiPropertyOptional({ enum: PaymentMethodEnum}) 
  @IsEnum(PaymentMethodEnum, { message: 'Payment method must be one of the following: COD, SSL, BKASH' })
  @IsNotEmpty({ message: 'Payment method must be provided' })
  paymentMethod: PaymentMethodEnum;
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
