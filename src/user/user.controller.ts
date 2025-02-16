import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth('jwt')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async resetPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      await this.userService.changePassword(
        jwtPayload,
        changePasswordDto.previousPassword,
        changePasswordDto.confirmNewPassword,
        changePasswordDto.newPassword,
      );
      return { message: 'Password changed successfully', payload: true };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @ApiOperation({ summary: 'Get list of users' })
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Get()
  async getAll(@Query() dto: UserSearchDto) {
    try {
      const payload = await this.userService.getAll(dto);

      return { message: 'User List!', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }

  @ApiOperation({ summary: 'Get logged in user profile' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@UserPayload() jwtPayload: JwtPayloadInterface) {
    try {
      const payload = await this.userService.getProfile(jwtPayload);

      return { message: 'User Profile!', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }

  @ApiOperation({ summary: 'Update logged in user profile ' })
  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Body() userDto: UpdateUserDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.userService.update(
        userDto,
        jwtPayload,
      );
      return { message: 'Profile updated successfully!', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }
}
