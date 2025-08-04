import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentStrategy } from './payment-strategy.interface';
import { OrderEntity } from 'src/order/entities/order.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { SslCommerzService } from '../services/ssl-commerz.service';

@Injectable()
export class SslStrategy implements PaymentStrategy {
  constructor(private readonly sslCommerzService: SslCommerzService) {}

  async pay(
    order: OrderEntity,
    dto: CreateOrderDto,
    jwt: JwtPayloadInterface,
  ): Promise<{ providerResponse: any }> {
    try {
      const paymentResult = await this.sslCommerzService.initiatePayment(order, dto);

      return {
        providerResponse: {
          status: 'INITIATED',
          redirectUrl: paymentResult.redirectUrl,
          sessionKey: paymentResult.sessionKey,
          transactionId: paymentResult.transactionId,
          paymentId: paymentResult.paymentId,
        },
      };
    } catch (error) {
      console.error('SSL Strategy payment error:', error);
      throw new InternalServerErrorException(
        `SSL Commerz payment initiation failed: ${error.message}`,
      );
    }
  }
}
