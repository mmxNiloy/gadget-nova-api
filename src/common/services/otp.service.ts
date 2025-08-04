import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class OtpService {
  private readonly redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
    });
  }

  async generateOtp(phoneNumber: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis with 5 minutes expiration
    const key = `otp:${phoneNumber}`;
    await this.redis.setex(key, 300, otp); // 5 minutes = 300 seconds
    
    return otp;
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const key = `otp:${phoneNumber}`;
    const storedOtp = await this.redis.get(key);
    
    if (storedOtp === otp) {
      // Delete the OTP after successful verification
      await this.redis.del(key);
      return true;
    }
    
    return false;
  }

  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Use the SMS service to send OTP
      const result = await this.smsService.sendOtp(phoneNumber);
      
      if (result.success) {
        // Store OTP in Redis for verification
        const otp = result.otp;
        const key = `otp:${phoneNumber}`;
        await this.redis.setex(key, 300, otp); // 5 minutes = 300 seconds
        
        return {
          success: true,
          message: 'OTP sent successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to send OTP',
        };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  }
} 