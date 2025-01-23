import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({default: "Monitor"})
  @IsNotEmpty({ message: 'Category name be non empty' })
  @IsString({ message: 'Category name Must be a string' })
  name: string;
}
