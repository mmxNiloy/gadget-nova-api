import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ default: 'ViweSonic' })
  @IsNotEmpty({ message: 'Brand name be non empty' })
  @IsString({ message: 'Brand name Must be a string' })
  name: string;

  @ApiProperty({ type: [String] })
  @IsNotEmpty({ message: 'Category IDs must be defined' })
  @IsUUID('all', {
    each: true,
    message: 'Category IDs must be an array of UUIDs',
  })
  category_ids: string[];
}
