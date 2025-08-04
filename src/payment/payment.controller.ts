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
  Version,
} from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import { SslCommerzService } from './services/ssl-commerz.service';
import { SslCommerzResponseDto } from './dto/ssl-commerz-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { BkashPaymentService } from './bkash-payment.service';
import { Like } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly sslCommerzService: SslCommerzService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly bkashPaymentService: BkashPaymentService,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
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
      shippingInfo: {
        ...order.shippingInfo,
        district_id: order.shippingInfo.district?.id || '',
      },
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
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/success?orderId=${result.order.id}&paymentId=${result.payment.id}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Payment success processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent(error.message)}`;
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

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?orderId=${orderId}&error=${encodeURIComponent(responseData.error || 'Payment failed')}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Payment failure processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent(error.message)}`;
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

      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/cancelled?orderId=${orderId}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Payment cancellation processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent(error.message)}`;
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

  // bKash callback endpoint
  @Post('bkash/callback')
  async bkashPaymentCallback(
    @Body() responseData: any,
    @Res() res: Response,
  ) {
    try {
      console.log('bKash payment callback received:', responseData);

      const { paymentID, transactionStatus, orderID } = responseData;

      if (transactionStatus === 'Completed') {
        // Execute the payment
        const executeResult = await this.bkashPaymentService.executePayment(paymentID);
        
        if (executeResult.transactionStatus === 'Completed') {
          // Update order status to PAID
          await this.orderService.updateOrderStatus(
            orderID,
            OrderStatus.PAID,
          );

          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/success?orderId=${orderID}&paymentId=${paymentID}`;
          return res.redirect(redirectUrl);
        } else {
          // Payment execution failed
          await this.orderService.updateOrderStatus(
            orderID,
            OrderStatus.FAILED,
          );

          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?orderId=${orderID}&error=${encodeURIComponent('Payment execution failed')}`;
          return res.redirect(redirectUrl);
        }
      } else {
        // Payment failed
        await this.orderService.updateOrderStatus(
          orderID,
          OrderStatus.FAILED,
        );

        const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?orderId=${orderID}&error=${encodeURIComponent('Payment failed')}`;
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('bKash payment callback processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  }

  // bKash callback endpoint for GET requests (with query parameters)
  @Get('bkash/callback')
  async bkashPaymentCallbackGet(
    @Query() query: any,
    @Res() res: Response,
  ) {
    try {
      console.log('bKash payment callback GET received:', query);

      const { paymentID, status, signature, apiVersion } = query;
      
      // For GET requests, we need to query the payment status first
      if (paymentID) {
        const paymentStatus = await this.bkashPaymentService.queryPayment(paymentID);
        console.log('Payment status:', paymentStatus);

        if (paymentStatus.transactionStatus === 'Initiated') {
          // Payment is initiated but not executed yet
          // We need to execute the payment
          console.log('Executing bKash payment for paymentID:', paymentID);
          
          try {
            const executeResult = await this.bkashPaymentService.executePayment(paymentID);
            console.log('Execute payment result:', executeResult);
            
            if (executeResult.transactionStatus === 'Completed') {
              // Payment executed successfully
              const order = await this.findOrderByPaymentId(paymentID);
              
              if (order) {
                // Update order status to PAID
                await this.orderService.updateOrderStatus(
                  order.id,
                  OrderStatus.PAID,
                );

                const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/success?orderId=${order.id}&paymentId=${paymentID}`;
                return res.redirect(redirectUrl);
              } else {
                const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent('Order not found')}`;
                return res.redirect(redirectUrl);
              }
            } else {
              // Payment execution failed
              const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?paymentId=${paymentID}&error=${encodeURIComponent('Payment execution failed')}`;
              return res.redirect(redirectUrl);
            }
          } catch (executeError) {
            console.error('Payment execution failed:', executeError);
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?paymentId=${paymentID}&error=${encodeURIComponent('Payment execution failed')}`;
            return res.redirect(redirectUrl);
          }
        } else if (paymentStatus.transactionStatus === 'Completed') {
          // Payment already completed
          const order = await this.findOrderByPaymentId(paymentID);
          
          if (order) {
            // Update order status to PAID
            await this.orderService.updateOrderStatus(
              order.id,
              OrderStatus.PAID,
            );

            const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/success?orderId=${order.id}&paymentId=${paymentID}`;
            return res.redirect(redirectUrl);
          } else {
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent('Order not found')}`;
            return res.redirect(redirectUrl);
          }
        } else {
          // Payment failed or cancelled
          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?paymentId=${paymentID}&error=${encodeURIComponent('Payment not completed')}`;
          return res.redirect(redirectUrl);
        }
      } else {
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent('Payment ID not found')}`;
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('bKash payment callback GET processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  }

  // Helper method to find order by payment ID
  private async findOrderByPaymentId(paymentID: string) {
    try {
      // You might need to adjust this based on your payment entity structure
      const payment = await this.paymentRepository.findOne({
        where: { providerResponse: Like(`%${paymentID}%`) },
        relations: ['order'],
      });
      
      return payment?.order;
    } catch (error) {
      console.error('Error finding order by payment ID:', error);
      return null;
    }
  }

  // bKash payment status check
  @Get('bkash/status/:paymentID')
  @UseGuards(JwtAuthGuard)
  async getBkashPaymentStatus(@Param('paymentID') paymentID: string) {
    try {
      const result = await this.bkashPaymentService.queryPayment(paymentID);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Test bKash environments
  @Get('bkash/test-environments')
  @UseGuards(JwtAuthGuard)
  async testBkashEnvironments() {
    try {
      const results = await this.bkashPaymentService.testBkashEnvironments();
      
      return {
        success: true,
        message: 'bKash environment test completed',
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
} 