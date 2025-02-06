import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class CreateQuestionAnswersDto {
  @ApiPropertyOptional({ default: 'No, Fixed Price.' })
  @IsOptional()
  @IsString({ message: 'Answer must be a string' })
  answer: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Question ID must be defined' })
  @IsUUID('all', { message: 'Question must be a valid UUID' })
  question_id: string;
}
