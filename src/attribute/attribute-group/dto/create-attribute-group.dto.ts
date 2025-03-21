import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAttributeGroupDto {
  @ApiProperty({ default: 'Screen Size' })
  // @IsNotEmpty({ message: 'Title must be non-empty' })
  // @IsString({ message: 'Title must be a string' })
  // @MaxLength(255, { message: 'Maximum 255 characters supported for title' })
  title: string;
}
