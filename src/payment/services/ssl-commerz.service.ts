import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { OrderEntity } from 'src/order/entities/order.entity';
import { PaymentEntity } from 'src/payment/entities/payment.entity';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { InitiateSslCommerzPaymentDto } from '../dto/initiate-ssl-pay.dto';
import { SslCommerzResponseDto } from '../dto/ssl-commerz-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodEnum } from 'src/common/enums/payment-method.enum';

@Injectable()
export class SslCommerzService {
  private readonly STORE_ID = process.env.SSL_STORE_ID || 'gadgetnova2live';
  private readonly STORE_PASSWORD = process.env.SSL_STORE_PASS || '6536491D077B346331';
  private readonly BASE_URL = process.env.SSL_BASE_URL || 'https://securepay.sslcommerz.com';

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  async initiatePayment(order: OrderEntity, dto: CreateOrderDto): Promise<any> {
    const payload: InitiateSslCommerzPaymentDto = {
      store_id: this.STORE_ID,
      store_passwd: this.STORE_PASSWORD,
      total_amount: order.totalPrice,
      currency: 'BDT',
      tran_id: `TXN_${order.id}_${Date.now()}`, // Unique transaction ID
      success_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/payment/ssl/success`,
      fail_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/payment/ssl/fail`,
      cancel_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/payment/ssl/cancel`,
      cus_name: `${dto.shippingInfo.first_name} ${dto.shippingInfo.last_name}`,
      cus_email: dto.shippingInfo.email,
      cus_add1: dto.shippingInfo.address,
      cus_phone: dto.shippingInfo.phone,
      product_name: 'Gadget Nova Order',
      product_category: 'Electronics',
      product_profile: 'general',
      emi_option: 0,
      cus_city: 'Dhaka', // Default city since it's not in shipping info
      cus_postcode: '1200', // Default postal code since it's not in shipping info
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      num_of_item: 1,
      value_a: order.id, // Store order ID for validation
      value_b: order.user.id, // Store user ID for validation
      value_c: order.totalPrice.toString(), // Store amount for validation
    };

    try {
      const response = await axios.post(
        `${this.BASE_URL}/gwprocess/v4/api.php`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      console.log(response.data);
      

      if (response.data?.status !== 'SUCCESS') {
        throw new InternalServerErrorException(
          `SSL Commerz payment initiation failed: ${response.data?.failedreason || 'Unknown error'}`,
        );
      }

      // Save payment record
      const payment = this.paymentRepository.create({
        order: order,
        paymentMethod: PaymentMethodEnum.SSL,
        providerResponse: JSON.stringify({
          status: 'INITIATED',
          sessionKey: response.data.sessionkey,
          gatewayPageURL: response.data.GatewayPageURL,
          transactionId: payload.tran_id,
          timestamp: new Date().toISOString(),
        }),
      });

      await this.paymentRepository.save(payment);

      return {
        status: 'SUCCESS',
        redirectUrl: response.data.GatewayPageURL,
        sessionKey: response.data.sessionkey,
        transactionId: payload.tran_id,
        paymentId: payment.id,
      };
    } catch (error) {
      console.error('SSL Commerz payment initiation error:', error);
      throw new InternalServerErrorException(
        `SSL Commerz payment initiation failed: ${error.message}`,
      );
    }
  }

  async validatePaymentResponse(responseData: SslCommerzResponseDto): Promise<any> {
    // Validate the response
    if (!responseData.tran_id || !responseData.status) {
      throw new BadRequestException('Invalid payment response data');
    }

    // Extract order ID from transaction ID
    const orderId = responseData.tran_id.split('_')[1];
    if (!orderId) {
      throw new BadRequestException('Invalid transaction ID format');
    }

    // Verify payment with SSL Commerz
    const verificationPayload = {
      store_id: this.STORE_ID,
      store_passwd: this.STORE_PASSWORD,
      val_id: responseData.val_id,
    };

    try {
      const verificationResponse = await axios.post(
        `${this.BASE_URL}/validator/api/validationserverAPI.php`,
        verificationPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const verificationData = verificationResponse.data;

      // Find the payment record
      const payment = await this.paymentRepository.findOne({
        where: {
          order: { id: orderId },
          paymentMethod: PaymentMethodEnum.SSL,
        },
        relations: ['order'],
      });

      if (!payment) {
        throw new BadRequestException('Payment record not found');
      }

      // Update payment with response data
      payment.providerResponse = JSON.stringify({
        ...JSON.parse(payment.providerResponse || '{}'),
        sslResponse: responseData,
        verificationResponse: verificationData,
        paymentStatus: responseData.status,
        paymentDate: new Date().toISOString(),
      });

      await this.paymentRepository.save(payment);

      return {
        payment,
        order: payment.order,
        sslResponse: responseData,
        verificationResponse: verificationData,
      };
    } catch (error) {
      console.error('SSL Commerz payment verification error:', error);
      throw new InternalServerErrorException(
        `Payment verification failed: ${error.message}`,
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      payment,
      order: payment.order,
      providerResponse: JSON.parse(payment.providerResponse || '{}'),
    };
  }
} 