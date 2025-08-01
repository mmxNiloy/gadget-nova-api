import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({ 
    default: '01712345678',
    description: 'Phone number to send OTP for password reset'
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Phone number must be a valid Bangladeshi mobile number' })
  @MaxLength(15, { message: 'Maximum 15 characters supported' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ 
    default: '01712345678',
    description: 'Phone number'
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Phone number must be a valid Bangladeshi mobile number' })
  @MaxLength(15, { message: 'Maximum 15 characters supported' })
  phone: string;

  @ApiProperty({ 
    default: '123456',
    description: 'OTP received via SMS'
  })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  @MaxLength(6, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    default: '01712345678',
    description: 'Phone number'
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Phone number must be a valid Bangladeshi mobile number' })
  @MaxLength(15, { message: 'Maximum 15 characters supported' })
  phone: string;

  @ApiProperty({ 
    default: 'newpassword123',
    description: 'New password'
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(100, { message: 'Maximum 100 characters supported' })
  newPassword: string;

  @ApiProperty({ 
    default: 'newpassword123',
    description: 'Confirm new password'
  })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' })
  @MaxLength(100, { message: 'Maximum 100 characters supported' })
  confirmPassword: string;
} 