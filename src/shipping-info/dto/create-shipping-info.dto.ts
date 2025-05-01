import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateShippingInfoDto {
  @ApiProperty({ default: 'Sadiquzzaman' })
  @IsNotEmpty({ message: 'First name must be non-empty' })
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'Maximum 50 characters supported for first name' })
  first_name: string;

  @ApiProperty({ default: 'Shovon' })
  @IsNotEmpty({ message: 'Last name must be non-empty' })
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Maximum 50 characters supported for Last name' })
  last_name: string;

  @ApiProperty({ default: 'company_name' })
  @IsOptional()
  @IsString({ message: 'company name must be a string' })
  @MaxLength(50, { message: 'Maximum 50 characters supported for company name' })
  company_name: string;

  @ApiProperty({ default: 'test@gmail.com' })
  @IsNotEmpty({ message: 'email must be non-empty' })
  @IsString({ message: 'email must be a string' })
  @MaxLength(50, { message: 'Maximum 50 characters supported for email' })
  email: string;

  @ApiProperty({ default: '01734911480' })
  @IsNotEmpty({ message: 'phone must be non-empty' })
  @IsString({ message: 'phone must be a string' })
  @MaxLength(50, { message: 'Maximum 50 characters supported for phone' })
  phone: string;

  @ApiProperty({ default: 'address' })
  @IsNotEmpty({ message: 'address must be non-empty' })
  @IsString({ message: 'address must be a string' })
  address: string;

  @ApiProperty({ default: 'additional_info' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  additional_info: string;
}
