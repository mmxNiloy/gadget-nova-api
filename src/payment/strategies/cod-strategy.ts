import { Injectable } from '@nestjs/common';
import { PaymentStrategy } from './payment-strategy.interface';

@Injectable()
export class CodStrategy implements PaymentStrategy {
  async pay(order: any): Promise<any> {
    return {
      paymentStatus: 'PENDING',
      method: 'COD',
      message: 'Cash on Delivery selected. Admin will confirm by phone.',
    };
  }
}