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
  BadRequestException,
  BadGatewayException,
  UseInterceptors,
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
import { ApiTags } from '@nestjs/swagger';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { NotificationService } from '../notification/notification.service';

@ApiTags('payment')
@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(
    private readonly sslCommerzService: SslCommerzService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly bkashPaymentService: BkashPaymentService,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    private readonly notificationService: NotificationService,
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
        
        // Send order placed notification (since payment is now successful)
        try {
          await this.notificationService.sendOrderPlacedNotification(result.order);
        } catch (error) {
          console.error('Failed to send order placed notification:', error);
        }
      }

      // Redirect to success page
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/profile/order/success/${result.order.id}`;
      
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
          
          // Send order placed notification (since payment is now successful)
          try {
            const order = await this.orderService.findOne(orderID);
            if (order) {
              await this.notificationService.sendOrderPlacedNotification(order);
            }
          } catch (error) {
            console.error('Failed to send order placed notification:', error);
          }

          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/profile/order/success/${orderID}`;
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
  @UseInterceptors()
  async bkashPaymentCallbackGet(
    @Query() query: any,
    @Res({ passthrough: false }) res: Response
  ): Promise<{ message: string; payload: any }> {
    try {
      console.log('bKash payment callback GET received:', query);
  
      const { paymentID, status } = query;
  
      if (!paymentID) {
        console.error('No paymentID received in callback');
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent('Payment ID not found')}`;
        res.redirect(redirectUrl);
        return { message: 'Redirecting due to missing paymentID', payload: null };
      }
  
      console.log('Processing paymentID:', paymentID);
  
      let executeResult: any;
  
      if (status === 'success') {
        console.log('Executing bKash payment for paymentID:', paymentID);
        try {
          executeResult = await this.bkashPaymentService.executePayment(paymentID);
          
        } catch (error) {
          console.error('bKash execution error:', error);
          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?paymentId=${paymentID}&error=${encodeURIComponent('bKash execution failed')}`;
          res.redirect(redirectUrl);
          return { message: 'Redirecting due to missing paymentID', payload: null }
        }
      }
  
      console.log('Execute payment result:', executeResult);
  
      if (executeResult?.transactionStatus === 'Completed') {
        console.log('Payment completed successfully! Money deducted.');
  
        let order;
        try {
          order = await this.findOrderByPaymentId(paymentID);
        } catch (error) {
          console.error('Order fetch error:', error);
          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent('Order not found')}`;
          res.redirect(redirectUrl);
          return { message: 'Redirecting due to missing paymentID', payload: null };
        }
  
                if (order) {
          await this.orderService.updateOrderStatus(order.id, OrderStatus.PAID);

          // Send order placed notification (since payment is now successful)
          try {
            await this.notificationService.sendOrderPlacedNotification(order);
          } catch (error) {
            console.error('Failed to send order placed notification:', error);
          }

          // Handle date formatting here before update
          const rawTime = executeResult.paymentExecuteTime;
          const cleanedTime = rawTime.replace(/:(\d+)\sGMT\+\d+$/, '.$1');
          const parsedTime = new Date(cleanedTime);
  
          if (isNaN(parsedTime.getTime())) {
            console.warn('Invalid payment time format after cleanup:', cleanedTime);
          }
  
          executeResult.paymentExecuteTime = parsedTime;
  
          await this.updatePaymentWithTransactionDetails(paymentID, executeResult);
  
          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/profile/order/success/${order.id}`;
          res.redirect(redirectUrl);
          return { message: 'Redirecting due to missing paymentID', payload: null };
        } else {
          const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent('Order not found')}`;
          res.redirect(redirectUrl);
          return { message: 'Redirecting due to missing paymentID', payload: null };
        }
      } else {
        console.error('Payment execution failed. Status:', executeResult?.transactionStatus);
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/failed?paymentId=${paymentID}&error=${encodeURIComponent('Payment execution failed')}`;
        res.redirect(redirectUrl);
        return { message: 'Redirecting due to missing paymentID', payload: null };
      }
    } catch (error) {
      console.error('bKash payment callback GET processing error:', error);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://relovohr.com:6020'}/payment/error?message=${encodeURIComponent(error.message || 'Unknown error')}`;
      res.redirect(redirectUrl);
      return { message: 'Redirecting due to missing paymentID', payload: null };
    }
  }
  

  private async findOrderByPaymentId(paymentID: string) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { paymentId: paymentID},
        relations: ['order', 'order.user', 'order.shippingInfo'],
      });

      console.log("Payment response before returnig",{payment});
      
      
      return payment?.order;
    } catch (error) {
      console.error('Error finding order by payment ID:', error);
      return null;
    }
  }

  // Helper method to update payment with transaction details
  private async updatePaymentWithTransactionDetails(paymentID: string, executeResult: any) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { paymentId: paymentID },
      });
      
      if (payment) {
        let paymentTime: Date | null = null;

      const rawTime = executeResult.paymentExecuteTime;

      if (typeof rawTime === 'string') {
        const cleanedTime = rawTime.replace(/:(\d+)\sGMT\+\d+$/, '.$1');
        paymentTime = new Date(cleanedTime);

        if (isNaN(paymentTime.getTime())) {
          console.warn('Invalid payment time format (string):', rawTime);
          paymentTime = null;
        }
      } else if (rawTime instanceof Date) {
        paymentTime = rawTime;
      } else {
        console.warn('Unexpected paymentExecuteTime type:', typeof rawTime);
      }

      payment.paymentStatus = PaymentStatus.PAID;
      payment.executeResponse = JSON.stringify(executeResult);
      payment.payerReference = executeResult.payerReference;
      payment.paymentTime = isNaN(paymentTime.getTime()) ? null : paymentTime;
      payment.paidAmount = parseFloat(executeResult.amount);
      payment.transactionId = executeResult.trxID;
      payment.transactionStatus = executeResult.transactionStatus;
      payment.merchantInvoiceNumber = executeResult.merchantInvoiceNumber;

      await this.paymentRepository.save(payment);
        
        console.log('Payment provider response updated with transaction details:', executeResult.trxID);
      }
    } catch (error) {
      console.error('Error updating payment with transaction details:', error);
    }
  }

  // bKash payment status check (no auth required for testing)
  @Get('bkash/status/:paymentID')
  // @UseGuards(JwtAuthGuard)
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
} 