import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Bool } from 'src/common/enums/bool.enum';
import { Transform } from 'class-transformer';
import { ApiQueryPaginationBaseDTO } from 'src/common/dtos/pagination/api-query-pagination-base.dto';

export class CreatePromotionalDiscountDto {
  @ApiProperty({
    default: Bool.NO,
    description: 'Defines if the discount is percentage-based',
  })
  @IsEnum(Bool, { message: 'is_percentage must be either 0 (NO) or 1 (YES)' })
  @IsNotEmpty({ message: 'is_percentage cannot be empty' })
  is_percentage: Bool;

  @ApiPropertyOptional({ default: 10.0 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Amount must be a decimal' })
  amount: number;

  @ApiProperty({
    default: new Date().toISOString(),
    description: 'Start date of the promotional discount (ISO format)',
  })
  @IsDateString(
    {},
    { message: 'startDate must be a valid ISO 8601 date string' },
  )
  @IsNotEmpty({ message: 'startDate cannot be empty' })
  @Transform(({ value }) => value ?? new Date().toISOString())
  startDate: string;

  @ApiProperty({
    default: new Date().toISOString(),
    description: 'End date of the promotional discount (ISO format)',
  })
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'endDate cannot be empty' })
  @Transform(({ value }) => value ?? new Date().toISOString())
  endDate: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'product Id cannot be empty' })
  @IsUUID('all', { message: 'product Id must be a valid UUID' })
  product_id: string;
}

export class PromotionSearchDto extends ApiQueryPaginationBaseDTO {
  @ApiProperty({
    default: 'Product 1',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  title: string;
}
