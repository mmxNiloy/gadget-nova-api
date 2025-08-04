import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, Matches, IsOptional, ValidateIf } from 'class-validator';

export class LocalAuthUserDto {
  @ApiProperty({ default: 'sadikuzzaman1996@gmail.com', required: false })
  @ValidateIf((o) => !o.phone)
  @IsNotEmpty({ message: 'Email is required when phone is not provided' })
  @IsEmail()
  @MaxLength(100, { message: 'Maximum 100 characters supported' })
  email?: string;

  @ApiProperty({ default: '01734911480', required: false })
  @ValidateIf((o) => !o.email)
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Phone number must be a valid Bangladeshi mobile number' })
  @MaxLength(15, { message: 'Maximum 15 characters supported' })
  phone?: string;

  @ApiProperty({ default: '12345678' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: 'Must be non empty' })
  @IsString({ message: 'Must be a string' })
  @MaxLength(100, { message: 'Maximum 100 characters supported' })
  password: string;
}
