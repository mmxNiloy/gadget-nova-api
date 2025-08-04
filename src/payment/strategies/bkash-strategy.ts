import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentStrategy } from './payment-strategy.interface';
import { OrderEntity } from 'src/order/entities/order.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { BkashPaymentService } from '../bkash-payment.service';

@Injectable()
export class BkashStrategy implements PaymentStrategy {
  constructor(private readonly bkashPaymentService: BkashPaymentService) {}

  async pay(
    order: OrderEntity,
    dto: CreateOrderDto,
    jwt: JwtPayloadInterface,
  ): Promise<{ providerResponse: any }> {
    try {
      // Calculate total amount
      const totalAmount = order.totalPrice || 0;
      
      // Create callback URL using BACKEND_URL with production fallback
      const callbackUrl = `${process.env.BACKEND_URL || 'https://api.relovohr.com'}/api/v1/payment/bkash/callback`;
      console.log('bKash callback URL:', callbackUrl);
      console.log('BACKEND_URL env:', process.env.BACKEND_URL);
      console.log('All env vars:', {
        BACKEND_URL: process.env.BACKEND_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        NODE_ENV: process.env.NODE_ENV
      });
      
      // Create bKash payment
      const paymentResponse = await this.bkashPaymentService.createPayment(
        totalAmount,
        order.id,
        callbackUrl
      );

      return {
        providerResponse: {
          success: true,
          paymentID: paymentResponse.paymentID,
          bkashURL: paymentResponse.bkashURL,
          transactionStatus: paymentResponse.transactionStatus,
          message: 'bKash payment created successfully',
          data: paymentResponse
        }
      };
    } catch (error) {
      console.error('bKash payment failed:', error);
      throw new InternalServerErrorException(
        `bKash payment failed: ${error.message}`
      );
    }
  }
} 