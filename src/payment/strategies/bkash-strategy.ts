import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentStrategy } from './payment-strategy.interface';
import { OrderEntity } from 'src/order/entities/order.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class BkashStrategy implements PaymentStrategy {
  async pay(
    order: OrderEntity,
    dto: CreateOrderDto,
    jwt: JwtPayloadInterface,
  ): Promise<{ providerResponse: any }> {
    // TODO: Implement bKash payment integration
    // For now, return a placeholder response
    throw new InternalServerErrorException(
      'bKash payment integration is not yet implemented. Please use SSL or COD payment methods.',
    );
  }
} 