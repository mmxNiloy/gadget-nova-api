import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BkashPaymentService {
  constructor(private readonly configService: ConfigService) {}

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
    return 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'; // Use sandbox URL for testing
  }

  async getToken(): Promise<string> {
    try {
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

      return response.data.id_token;
    } catch (error) {
      console.error('bKash token generation failed:', error);
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