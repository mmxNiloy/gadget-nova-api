import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { PaymentMethodEnum } from 'src/common/enums/payment-method.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentMethodEnum })
  @IsOptional()
  @IsEnum(PaymentMethodEnum, { message: 'Payment method must be one of the following: COD, SSL, BKASH' })
  paymentMethod?: PaymentMethodEnum;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Payment status must be a valid payment status' })
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerResponse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executeResponse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payerReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  merchantInvoiceNumber?: string;
}
