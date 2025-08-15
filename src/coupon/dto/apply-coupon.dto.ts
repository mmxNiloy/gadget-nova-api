import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength
} from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: 'Coupon code', example: 'WELCOME50' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  couponCode: string;
}
