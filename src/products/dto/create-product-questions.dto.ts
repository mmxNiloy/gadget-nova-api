import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class CreateProductQuestionsDto {
  @ApiPropertyOptional({ default: 'Can it be discounted?.' })
  @IsOptional()
  @IsString({ message: 'Question must be a string' })
  question: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Product ID must be defined' })
  @IsUUID('all', { message: 'Product must be a valid UUID' })
  product_id: string;
}
