import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  UseGuards,
  Request,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import { SslCommerzService } from './services/ssl-commerz.service';
import { SslCommerzResponseDto } from './dto/ssl-commerz-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { CreateOrderDto } from '../order/dto/create-order.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly sslCommerzService: SslCommerzService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  @Post('ssl/initiate')
  @UseGuards(JwtAuthGuard)
  async initiateSslPayment(
    @Body() body: { orderId: string },
    @Request() req,
  ) {
    const { orderId } = body;
    const userId = req.user.id;

    // Get order details
    const order = await this.orderService.findOne(orderId, userId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Create order DTO for payment
    const orderDto: CreateOrderDto = {
      shippingInfo: order.shippingInfo,
      paymentMethod: 'SSL' as any, // We know it's SSL for this endpoint
    };

    const paymentResult = await this.sslCommerzService.initiatePayment(
      order,
      orderDto,
    );

    return {
      success: true,
      data: paymentResult,
    };
  }

  @Post('ssl/success')
  async sslPaymentSuccess(
    @Body() responseData: SslCommerzResponseDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.sslCommerzService.validatePaymentResponse(
        responseData,
      );

      // Update order status to PAID
      if (result.payment && result.order) {
        await this.orderService.updateOrderStatus(
          result.order.id,
          OrderStatus.PAID,
        );
      }

      // Redirect to success page
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/payment/success?orderId=${result.order.id}&paymentId=${result.payment.id}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Payment success processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/payment/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  }

  @Post('ssl/fail')
  async sslPaymentFail(
    @Body() responseData: SslCommerzResponseDto,
    @Res() res: Response,
  ) {
    try {
      // Log failed payment
      console.log('Payment failed:', responseData);

      // Extract order ID from transaction ID
      const orderId = responseData.tran_id.split('_')[1];
      
      // Update order status to FAILED
      if (orderId) {
        await this.orderService.updateOrderStatus(
          orderId,
          OrderStatus.FAILED,
        );
      }

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/payment/failed?orderId=${orderId}&error=${encodeURIComponent(responseData.error || 'Payment failed')}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Payment failure processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/payment/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  }

  @Post('ssl/cancel')
  async sslPaymentCancel(
    @Body() responseData: SslCommerzResponseDto,
    @Res() res: Response,
  ) {
    try {
      // Log cancelled payment
      console.log('Payment cancelled:', responseData);

      // Extract order ID from transaction ID
      const orderId = responseData.tran_id.split('_')[1];
      
      // Update order status to CANCELLED
      if (orderId) {
        await this.orderService.updateOrderStatus(
          orderId,
          OrderStatus.CANCELLED,
        );
      }

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/payment/cancelled?orderId=${orderId}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Payment cancellation processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/payment/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  }

  @Get('ssl/status/:paymentId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    const result = await this.sslCommerzService.getPaymentStatus(paymentId);
    
    return {
      success: true,
      data: result,
    };
  }

  @Get('ssl/verify/:valId')
  async verifyPayment(@Param('valId') valId: string) {
    try {
      // This endpoint can be used to verify payment status
      const verificationPayload = {
        store_id: process.env.SSL_STORE_ID || 'gadgetnova2live',
        store_passwd: process.env.SSL_STORE_PASSWORD || '6536491D077B346331',
        val_id: valId,
      };

      const response = await axios.post(
        'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php',
        verificationPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const data = response.data;
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 