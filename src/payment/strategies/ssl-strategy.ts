import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PaymentStrategy } from './payment-strategy.interface';
import { OrderEntity } from 'src/order/entities/order.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { InitiateSslCommerzPaymentDto } from '../dto/initiate-ssl-pay.dto';

@Injectable()
export class SslStrategy implements PaymentStrategy {
  async pay(
    order: OrderEntity,
    dto: CreateOrderDto,
    jwt: JwtPayloadInterface,
  ): Promise<{ providerResponse: any }> {
    
    const payload: InitiateSslCommerzPaymentDto = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASS,
      total_amount: order.totalPrice,
      currency: 'BDT',
      tran_id: order.id,
      success_url: `http://localhost:5000/payment/success`,
      fail_url: `http://localhost:5000/payment/fail`,
      cancel_url: `http://localhost:5000/payment/cancel`,
      cus_name: dto.shippingInfo.first_name + ' ' + dto.shippingInfo.last_name,
      cus_email: dto.shippingInfo.email,
      cus_add1: dto.shippingInfo.address,
      cus_phone: dto.shippingInfo.phone,
      product_name: 'E-commerce Order',
      product_category: 'General',
      product_profile: 'general',
      emi_option: 0,
      cus_city: '',
      cus_postcode: '',
      cus_country: '',
      shipping_method: "NO",
      num_of_item: 1
    };

    console.log("🔥🔥🔥",payload);
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

      console.log(response);
      

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
