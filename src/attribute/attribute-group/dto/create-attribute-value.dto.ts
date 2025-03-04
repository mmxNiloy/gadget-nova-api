import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAttributeValueDto {
  @ApiProperty({ default: '15-17' })
  @IsNotEmpty({ message: 'Value be non empty' })
  @IsString({ message: 'Value Must be a string' })
  value: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Attribute Group ID must be defined' })
  @IsUUID('all', { message: 'Attribute Group must be a valid UUID' })
  attributeGroup_id: string;
}
