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
    return 'https://tokenized.pay.bka.sh/v1.2.0-beta'; // Use live production URL with correct version
  }

  // Method to test different bKash environments
  async testBkashEnvironments(): Promise<any> {
    const environments = [
      { name: 'Live Production', url: 'https://tokenized.pay.bka.sh/v1.2.0-beta' },
      { name: 'Live Production (Alternative)', url: 'https://tokenized.pay.bka.sh/v1.2.0' },
      { name: 'Sandbox', url: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta' }
    ];

    const results = [];

    for (const env of environments) {
      try {
        console.log(`\n--- Testing ${env.name} ---`);
        console.log('URL:', env.url);
        
        const response = await axios.post(`${env.url}/tokenized/checkout/token/grant`, {
          app_key: this.getAppKey(),
          app_secret: this.getAppSecret(),
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': this.getUsername(),
            'password': this.getPassword(),
          },
        });

        results.push({
          environment: env.name,
          url: env.url,
          status: 'SUCCESS',
          response: response.data
        });
        
        console.log('✅ SUCCESS:', env.name);
      } catch (error) {
        results.push({
          environment: env.name,
          url: env.url,
          status: 'FAILED',
          error: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          }
        });
        
        console.log('❌ FAILED:', env.name, error.response?.status, error.response?.data);
      }
    }

    return results;
  }

  async getToken(): Promise<string> {
    try {
      const username = this.getUsername();
      const password = this.getPassword();
      const appKey = this.getAppKey();
      const appSecret = this.getAppSecret();
      const baseUrl = this.getBaseUrl();

      console.log('bKash token request details:');
      console.log('URL:', `${baseUrl}/tokenized/checkout/token/grant`);
      console.log('Username:', username);
      console.log('App Key:', appKey);
      console.log('App Secret:', appSecret ? '***' : 'NOT SET');

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

      console.log('bKash token response:', response.data);
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