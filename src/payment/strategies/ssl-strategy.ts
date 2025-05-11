import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PaymentStrategy } from './payment-strategy.interface';
import { OrderEntity } from 'src/order/entities/order.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class SslStrategy implements PaymentStrategy {
  async pay(
    order: OrderEntity,
    dto: CreateOrderDto,
    jwt: JwtPayloadInterface,
  ): Promise<{ providerResponse: any }> {
    const payload = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASS,
      total_amount: order.totalPrice,
      currency: 'BDT',
      tran_id: order.id,
      success_url: `${process.env.BASE_URL}/payment/success`,
      fail_url: `${process.env.BASE_URL}/payment/fail`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel`,
      cus_name: dto.shippingInfo.first_name + ' ' + dto.shippingInfo.last_name,
      cus_email: dto.shippingInfo.email,
      cus_add1: dto.shippingInfo.address,
      cus_phone: dto.shippingInfo.phone,
      product_name: 'E-commerce Order',
      product_category: 'General',
      product_profile: 'general',
    };

    try {
      const response = await axios.post(
        'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.status !== 'SUCCESS') {
        throw new InternalServerErrorException('SSLCommerz payment initiation failed');
      }

      return {
        providerResponse: {
          status: 'INITIATED',
          redirectUrl: response.data.GatewayPageURL,
          transactionId: response.data,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('SSLCommerz payment initiation error: ' + err.message);
    }
  }
}
