import { Injectable, BadRequestException } from '@nestjs/common';
import { UserReponseDto } from 'src/user/dto/user-response.dto';
import { UserService } from 'src/user/user.service';
import { LocalAuthUserDto } from './dto/local-auth-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshAuthUserDto } from './dto/refresh-auth-user.dto';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { SmsService } from '../sms/sms.service';
import { ForgetPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/forget-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly smsService: SmsService,
  ) {}

  //register a new user
  async signUp(registerUserDto: RegisterUserDto) {
    // Send OTP for phone verification
    const smsResult = await this.smsService.sendOtp(registerUserDto.phone);

    console.log({smsResult});
    
    
    if (!smsResult.success) {
      throw new Error(`Failed to send OTP: ${smsResult.message}`);
    }

    // Create user with phone number
    await this.userService.create(registerUserDto);
    
    return {
      success: true,
      message: 'Registration successful. Please verify your phone number with the OTP sent.',
      data: {
        phone: registerUserDto.phone,
        otpSent: true,
      },
    };
  }

  //validate local user
  async validateLocalStrategyUser(
    localUser: LocalAuthUserDto,
  ): Promise<UserReponseDto> {
    return await this.userService.validateUserEmailPass(localUser);
  }

  async resetPassword(token, newPassword, confirmNewPassword) {
    return await this.userService.resetUserPassword(
      token,
      newPassword,
      confirmNewPassword,
    );
  }

  async generateAccessToken(refreshAuthUserDto: RefreshAuthUserDto) {
    return await this.userService.generateAccessToken(
      refreshAuthUserDto.refreshToken,
    );
  }

  async logOut(jwtPayload: JwtPayloadInterface) {
    return this.userService.logOut(jwtPayload.id);
  }

  // Forget password - send OTP
  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const phone = forgetPasswordDto.phone;

    const user = await this.userService.findByPhone(phone);
    
    if (!user) {
      throw new BadRequestException('No user found with this phone number');
    }

    // Send OTP for password reset
    const smsResult = await this.smsService.sendOtp(phone);
    
    if (!smsResult.success) {
      throw new Error(`Failed to send OTP: ${smsResult.message}`);
    }

    return {
      success: true,
      message: 'OTP sent successfully for password reset',
      data: {
        phone: phone,
        otpSent: true,
      },
    };
  }

  // Verify OTP for password reset
  async verifyOtpForPasswordReset(verifyOtpDto: VerifyOtpDto) {
    const phone = verifyOtpDto.phone;

    const user = await this.userService.findByPhone(phone);
    
    if (!user) {
      throw new BadRequestException('No user found with this phone number');
    }

    // Verify OTP
    const verifyResult = await this.smsService.verifyOtp(phone, verifyOtpDto.otp);
    
    if (!verifyResult.success) {
      throw new BadRequestException(verifyResult.message);
    }

    return {
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      data: {
        phone: phone,
        otpVerified: true,
      },
    };
  }

  // Reset password after OTP verification
  async resetPasswordWithOtp(resetPasswordDto: ResetPasswordDto) {
    const phone = resetPasswordDto.phone;

    const user = await this.userService.findByPhone(phone);
    
    if (!user) {
      throw new BadRequestException('No user found with this phone number');
    }

    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Reset password
    await this.userService.resetPasswordByPhone(phone, resetPasswordDto.newPassword);

    return {
      success: true,
      message: 'Password reset successfully',
      data: {
        phone: phone,
        passwordReset: true,
      },
    };
  }

  // Verify phone for registration
  async verifyPhoneForRegistration(verifyOtpDto: VerifyOtpDto) {
    const phone = verifyOtpDto.phone;

    const user = await this.userService.findByPhone(phone);
    
    if (!user) {
      throw new BadRequestException('No user found with this phone number');
    }

    // Verify OTP
    const verifyResult = await this.smsService.verifyOtp(phone, verifyOtpDto.otp);
    
    if (!verifyResult.success) {
      throw new BadRequestException(verifyResult.message);
    }

    // Update user as verified
    await this.userService.verifyUserByPhone(phone);

    return {
      success: true,
      message: 'Phone verified successfully. You can now login.',
      data: {
        phone: phone,
        phoneVerified: true,
      },
    };
  }
}
