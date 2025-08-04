import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../config/redis.service';
import axios from 'axios';

@Injectable()
export class BkashPaymentService {
  private readonly TOKEN_KEY = 'bkash:access_token';
  private readonly REFRESH_TOKEN_KEY = 'bkash:refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'bkash:token_expiry';

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  private getUsername(): string {
    return this.configService.get<string>('BKASH_USERNAME');
  }

  private getPassword(): string {
    return this.configService.get<string>('BKASH_PASSWORD');
  }

  private getAppKey(): string {
    return this.configService.get<string>('BKASH_APP_KEY');
  }

  private getAppSecret(): string {
    return this.configService.get<string>('BKASH_APP_SECRET');
  }

  private getBaseUrl(): string {
    return this.configService.get<string>('BKASH_BASE_URL'); 
  }

  private async isTokenExpired(): Promise<boolean> {
    try {
      const expiryTime = await this.redisService.get(this.TOKEN_EXPIRY_KEY);
      if (!expiryTime) {
        return true;
      }
      
      const expiry = parseInt(expiryTime);
      const now = Date.now();
      
      // Consider token expired if it expires within 2 minutes
      return now >= (expiry - 120000);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  private async storeToken(tokenData: any): Promise<void> {
    try {
      const expiresIn = tokenData.expires_in || 3600; // Use actual expiry from bKash
      const bufferTime = 120; // 2 minutes buffer before actual expiry
      const redisExpiry = expiresIn - bufferTime; // Store with buffer time
      const expiryTime = Date.now() + (expiresIn * 1000);
      
      await this.redisService.set(this.TOKEN_KEY, tokenData.id_token, redisExpiry);
      await this.redisService.set(this.REFRESH_TOKEN_KEY, tokenData.refresh_token, expiresIn + 3600); // Refresh token lasts longer
      await this.redisService.set(this.TOKEN_EXPIRY_KEY, expiryTime.toString(), redisExpiry);
      
      console.log(`bKash tokens stored in Redis with ${bufferTime}s buffer before expiry`);
    } catch (error) {
      console.error('Error storing tokens in Redis:', error);
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await this.redisService.get(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getToken(): Promise<string> {
    try {
      // Check if we have a valid token in Redis
      const storedToken = await this.getStoredToken();
      const isExpired = await this.isTokenExpired();
      
      if (storedToken && !isExpired) {
        console.log('Using cached bKash token');
        return storedToken;
      }

      // Token is expired or doesn't exist, get a new one
      console.log('Getting new bKash token');
      const username = this.getUsername();
      const password = this.getPassword();
      const appKey = this.getAppKey();
      const appSecret = this.getAppSecret();
      const baseUrl = this.getBaseUrl();

      const response = await axios.post(`${baseUrl}/tokenized/checkout/token/grant`, {
        app_key: appKey,
        app_secret: appSecret,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'username': username,
          'password': password,
        },
      });
      
      // Store the new token in Redis
      await this.storeToken(response.data);
      
      return response.data.id_token;
    } catch (error) {
      console.error('bKash token generation failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw new Error('Failed to generate bKash token');
    }
  }

  async createPayment(amount: number, orderId: string, callbackUrl: string): Promise<any> {
    try {
      const token = await this.getToken();
      const appKey = this.getAppKey();
      const baseUrl = this.getBaseUrl();

      const paymentData = {
        mode: '0011',
        payerReference: orderId,
        callbackURL: callbackUrl,
        amount: amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId,
      };

      const response = await axios.post(`${baseUrl}/tokenized/checkout/create`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': appKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error('bKash payment creation failed:', error);
      throw new Error('Failed to create bKash payment');
    }
  }

  async executePayment(paymentID: string): Promise<any> {
    try {
      const token = await this.getToken();
      const appKey = this.getAppKey();
      const baseUrl = this.getBaseUrl();

      const response = await axios.post(`${baseUrl}/tokenized/checkout/execute`, {
        paymentID: paymentID,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': appKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error('bKash payment execution failed:', error);
      throw new Error('Failed to execute bKash payment');
    }
  }

  async queryPayment(paymentID: string): Promise<any> {
    try {
      const token = await this.getToken();
      const appKey = this.getAppKey();
      const baseUrl = this.getBaseUrl();

      const response = await axios.post(`${baseUrl}/tokenized/checkout/payment/status`, {
        paymentID: paymentID,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
          'X-APP-Key': appKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error('bKash payment query failed:', error);
      throw new Error('Failed to query bKash payment');
    }
  }
} 