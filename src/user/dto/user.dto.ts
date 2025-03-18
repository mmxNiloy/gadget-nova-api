import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty()
  @IsNotEmpty({ message: 'Must be non empty' })
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
