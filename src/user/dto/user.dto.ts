import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { RolesEnum } from 'src/common/enums/roles.enum';

export class UserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Must be non empty' })
  @IsString({ message: 'Must be a string' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Must be non empty' })
  @IsString({ message: 'Must be a string' })
  email: string;

  @ApiProperty({ default: '01712345678' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Phone number must be a valid Bangladeshi mobile number' })
  @MaxLength(15, { message: 'Maximum 15 characters supported' })
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Must be a string' })
  reset_password_token: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Must be non empty' })
  @IsString({ message: 'Must be a string' })
  password: string;

  @ApiProperty({ enum: RolesEnum, default:RolesEnum.USER }) 
  @IsEnum(RolesEnum, { message: 'Role must be one of the following: admin, user, super_admin' })
  @IsOptional()
  role: RolesEnum;

  @ApiProperty({ enum: ActiveStatusEnum,default:ActiveStatusEnum.INACTIVE }) 
  @IsEnum(ActiveStatusEnum, { message: 'Status must be one of the following: active, inactive, pending' })
  @IsOptional()
  is_active: ActiveStatusEnum;
}
