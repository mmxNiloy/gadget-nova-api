import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto, OrderSearchDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { ShippingInfoService } from 'src/shipping-info/shipping-info.service';
import { PGWContext } from 'src/payment/pgw.context';
import { PaymentEntity } from 'src/payment/entities/payment.entity';
import { DistrictService } from 'src/district/district.service';
import { PaymentMethodEnum } from 'src/common/enums/payment-method.enum';
import { SmsService } from 'src/sms/sms.service';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { OtpService } from 'src/common/services/otp.service';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { CouponService } from 'src/coupon/coupon.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly shippingInfoService: ShippingInfoService,
    private readonly districtService: DistrictService,
    @Inject(forwardRef(() => PGWContext))
    private readonly pgwContext: PGWContext,
    private readonly smsService: SmsService,
    private readonly otpService: OtpService,
    private readonly couponService: CouponService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Generates a unique order ID in the format DDMMYYYY + sequential number
   * Example: 150820251 (15th August 2025, 1st order)
   * Example: 1508202515 (15th August 2025, 15th order)
   * Example: 1608202516 (16th August 2025, 16th order - continuing sequence)
   */
  private async generateOrderId(): Promise<number> {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    const datePrefix = parseInt(`${day}${month}${year}`);

    // Find the highest order ID across all orders (not just today)
    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderId IS NOT NULL')
      .orderBy('order.orderId', 'DESC')
      .getOne();

    let sequenceNumber = 1;
    if (lastOrder && lastOrder.orderId) {
      // Extract the sequence number from the last order ID
      const lastOrderIdStr = lastOrder.orderId.toString();
      if (lastOrderIdStr.length >= 8) {
        const lastSequence = parseInt(lastOrderIdStr.substring(8));
        sequenceNumber = lastSequence + 1;
      }
    }

    // Combine date prefix with sequence number
    const orderId = parseInt(`${datePrefix}${sequenceNumber}`);

    return orderId;
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<OrderEntity> {
    console.log('Starting order creation process...');

    // Check if OTP verification is required
    if (createOrderDto.otp) {
      console.log('OTP verification required for phone:', jwtPayload.phone);

      // Verify the OTP using phone from JWT payload
      const isOtpValid = await this.otpService.verifyOtp(
        jwtPayload.phone,
        createOrderDto.otp,
      );

      if (!isOtpValid) {
        throw new BadRequestException('Invalid OTP. Please try again.');
      }

      console.log('OTP verified successfully');
    }

    const cart = await this.cartRepository.findOne({
      where: {
        user: { id: jwtPayload.id },
        is_active: ActiveStatusEnum.ACTIVE,
      },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('No active cart found for order placement');
    }

    console.log('Cart found:', cart.id);

    let calculatedTotalPrice = 0;
    for (const item of cart.items) {
      const product = item.product;
      calculatedTotalPrice +=
        parseFloat(product.discountPrice.toString()) * item.quantity;
    }

    let totalPrice = 0;
    for (const item of cart.items) {
      const product = item.product;
      totalPrice += parseFloat(item.price.toString()) * item.quantity;
    }

    console.log('Price calculation debug:');
    console.log(
      'calculatedTotalPrice (from product.discountPrice):',
      calculatedTotalPrice,
    );
    console.log('totalPrice (from item.price):', totalPrice);
    console.log(
      'Cart items:',
      cart.items.map((item) => ({
        productTitle: item.product.title,
        discountPrice: item.product.discountPrice,
        itemPrice: item.price,
        quantity: item.quantity,
        itemTotal: parseFloat(item.price.toString()) * item.quantity,
      })),
    );

    if (calculatedTotalPrice !== totalPrice) {
      cart.items = [];
      cart.is_active = ActiveStatusEnum.INACTIVE;
      await this.cartRepository.save(cart);

      throw new BadRequestException({
        code: 'ORDER_PRICE_MISMATCH',
        message:
          'Product prices have changed. Cart has been cleared. Please create a new order.',
        updatedTotalPrice: calculatedTotalPrice,
      });
    }

    // Calculate delivery charge based on district
    const district = await this.districtService.findOne(
      createOrderDto.shippingInfo.district_id,
    );
    if (!district) {
      throw new BadRequestException('Invalid district selected');
    }

    const deliveryCharge = district.delivery_charge;
    console.log('Delivery charge:', deliveryCharge);

    const shippingData = {
      first_name: createOrderDto.shippingInfo.first_name,
      last_name: createOrderDto.shippingInfo.last_name,
      company_name: createOrderDto.shippingInfo.company_name,
      email: createOrderDto.shippingInfo.email,
      phone: createOrderDto.shippingInfo.phone,
      address: createOrderDto.shippingInfo.address,
      additional_info: createOrderDto.shippingInfo.additional_info,
      district_id: createOrderDto.shippingInfo.district_id,
    };

    const shippingInfo = await this.shippingInfoService.create(
      shippingData,
      jwtPayload,
    );

    console.log('Shipping info created:', shippingInfo.id);

    // Generate unique order ID
    const orderId = await this.generateOrderId();
    console.log('Generated order ID:', orderId);

    let totalPriceWithDelivery = totalPrice + Number(deliveryCharge);

    let discountData: any = null;

    if (createOrderDto.couponCode) {
      discountData = await this.couponService.verifyCoupon(jwtPayload.id, {
        couponCode: createOrderDto.couponCode,
      });

      totalPriceWithDelivery -= discountData.totalDiscount;
    }

    const order = this.orderRepository.create({
      user: { id: jwtPayload.id },
      cart,
      shippingInfo,
      orderId,
      totalPrice: totalPriceWithDelivery,
      delivery_charge: deliveryCharge,
      couponCode: createOrderDto.couponCode || null,
      couponDiscountValue: createOrderDto.couponCode
        ? discountData.totalDiscount
        : null,
      status: OrderStatus.PENDING,
      created_by: jwtPayload.id,
      created_user_name: jwtPayload.userName,
      created_at: new Date(),
    });

    console.log('Final price calculation:');
    console.log('totalPrice (products):', totalPrice);
    console.log('deliveryCharge:', deliveryCharge);
    console.log(
      'final totalPrice:',
      totalPrice + parseFloat(deliveryCharge.toString()),
    );
    console.log('Order object created, saving to database...');
    const savedOrder = await this.orderRepository.save(order);

    if (createOrderDto.couponCode) {
      await this.couponService.redeemCoupon(
        jwtPayload.id,
        createOrderDto.couponCode,
      );
    }
    console.log('Order saved successfully:', savedOrder.id);

    // Deactivate cart immediately after order is saved to prevent constraint violations
    cart.is_active = ActiveStatusEnum.INACTIVE;
    await this.cartRepository.save(cart);
    console.log('Cart deactivated successfully');

    // Update product stock and hold amounts
    for (const item of cart.items) {
      const product = item.product;
      product.stockAmount -= item.quantity;
      product.holdAmount -= item.quantity;
      await this.productRepository.save(product);
    }
    console.log('Product stock and hold amounts updated');

    // Load user information for notifications
    const userWithContactInfo = await this.userRepository.findOne({
      where: { id: jwtPayload.id },
      select: ['id', 'email', 'phone'],
    });

    // Attach user contact info to the order for notifications
    savedOrder.user = userWithContactInfo;

    // Handle different payment methods
    if (createOrderDto.paymentMethod === PaymentMethodEnum.COD) {
      console.log('Processing COD payment...');
      // For COD, create order with pending status and return immediately
      const payment = this.paymentRepository.create({
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
        order: savedOrder,
        paymentMethod: createOrderDto.paymentMethod,
        providerResponse: JSON.stringify({
          paymentStatus: 'PENDING',
          method: 'COD',
          message: 'Cash on Delivery selected. Admin will confirm by phone.',
        }),
        paymentStatus: PaymentStatus.PENDING,
        orderAmount: savedOrder.totalPrice,
      });

      await this.paymentRepository.save(payment);
      console.log('COD payment saved');

      // Initialize payments array if it doesn't exist
      if (!savedOrder.payments) {
        savedOrder.payments = [];
      }
      savedOrder.payments.push(payment);

      // For COD orders, send notification immediately
      try {
        await this.notificationService.sendOrderPlacedNotification(savedOrder);
      } catch (error) {
        console.error('Failed to send COD order notification:', error);
      }

      console.log('Returning COD order');
      return savedOrder;
    } else {
      console.log('Processing online payment:', createOrderDto.paymentMethod);
      // For bKash/SSL, create order with pending status and return payment URL
      // Don't send notification yet - wait for successful payment
      const paymentResult = await this.pgwContext
        .getStrategy(createOrderDto.paymentMethod)
        .pay(savedOrder, createOrderDto, jwtPayload);

      console.log('Payment result received:', paymentResult);

      const payment = this.paymentRepository.create({
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
        order: savedOrder,
        paymentMethod: createOrderDto.paymentMethod,
        providerResponse: JSON.stringify(paymentResult),
        paymentId: paymentResult?.providerResponse?.paymentID,
        paymentStatus: PaymentStatus.PENDING,
        orderAmount: savedOrder.totalPrice,
      });

      await this.paymentRepository.save(payment);
      console.log('Online payment saved');

      // Initialize payments array if it doesn't exist
      if (!savedOrder.payments) {
        savedOrder.payments = [];
      }
      savedOrder.payments.push(payment);

      // Add payment URL to the response for bKash/SSL
      savedOrder['paymentUrl'] =
        paymentResult.providerResponse?.bkashURL ||
        paymentResult.providerResponse?.redirectUrl;
      savedOrder['paymentId'] =
        paymentResult.providerResponse?.paymentID ||
        paymentResult.providerResponse?.sessionKey;

      console.log('Returning online payment order with URL');
      return paymentResult.providerResponse?.bkashURL;
    }
  }

  async confirmPayment(
    orderId: string,
    paymentId: string,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payments'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update order status to confirmed
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepository.save(order);

    return order;
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    orderSearchDto: OrderSearchDto,
    jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect('orders.payments', 'payments')
        .leftJoinAndSelect('orders.shippingInfo', 'shippingInfo')
        .leftJoinAndSelect('orders.cart', 'cart')
        .leftJoinAndSelect('cart.items', 'items')
        .leftJoinAndSelect('items.product', 'product');

      if (jwtPayload.role === RolesEnum.USER) {
        query.where('user.id = :userId', { userId: jwtPayload.id });
      }

      if (orderSearchDto.name) {
        query.andWhere('LOWER(user.name) LIKE :name', {
          name: `%${orderSearchDto.name.toLowerCase()}%`,
        });
      }

      if (orderSearchDto.email) {
        query.andWhere('LOWER(user.email) LIKE :email', {
          email: `%${orderSearchDto.email.toLowerCase()}%`,
        });
      }

      if (orderSearchDto.phone) {
        query.andWhere('LOWER(user.phone) LIKE :phone', {
          phone: `%${orderSearchDto.phone.toLowerCase()}%`,
        });
      }

      if (orderSearchDto.status) {
        query.andWhere('orders.status = :status', {
          status: orderSearchDto.status,
        });
      }

      if (orderSearchDto.orderId) {
        query.andWhere('orders.orderId = :orderId', {
          orderId: orderSearchDto.orderId,
        });
      }

      query
        .orderBy('orders.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      return await query.getManyAndCount();
    } catch (error) {
      console.log(error);

      throw new BadRequestException({
        message: 'Error fetching orders',
        details: error.message,
      });
    }
  }

  async findOne(id: string, userId?: string): Promise<OrderEntity> {
    const query = this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.id = :id', { id })
      .leftJoinAndSelect('orders.user', 'user')
      .leftJoinAndSelect('orders.payments', 'payments')
      .leftJoinAndSelect('orders.shippingInfo', 'shippingInfo')
      .leftJoinAndSelect('shippingInfo.district', 'district')
      .leftJoinAndSelect('orders.cart', 'cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (userId) {
      query.andWhere('orders.userId = :userId', { userId });
    }

    const order = await query.getOne();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'cart',
        'cart.items',
        'cart.items.product',
        'shippingInfo',
        'user',
        'payments',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const previousStatus = order.status;
    order.status = status as OrderStatus;
    const updatedOrder = await this.orderRepository.save(order);

    // Send notifications for ALL status changes with price breakdown
    try {
      // Map status to notification method
      const statusNotificationMap = {
        [OrderStatus.CANCELLED]:
          this.notificationService.sendOrderCancelledNotification,
        [OrderStatus.CONFIRMED]:
          this.notificationService.sendOrderConfirmedNotification,
        [OrderStatus.ON_THE_WAY]:
          this.notificationService.sendOrderShippedNotification,
        [OrderStatus.ON_HOLD]:
          this.notificationService.sendOrderOnHoldNotification,
        [OrderStatus.DELIVERED]:
          this.notificationService.sendOrderDeliveredNotification,
        [OrderStatus.PAID]: this.notificationService.sendOrderPaidNotification,
        [OrderStatus.FAILED]:
          this.notificationService.sendOrderFailedNotification,
        [OrderStatus.PENDING]:
          this.notificationService.sendOrderPendingNotification,
      };

      const notificationMethod = statusNotificationMap[status];
      if (notificationMethod && previousStatus !== status) {
        await notificationMethod.call(this.notificationService, updatedOrder);
        console.log(
          `Status change notification sent for order ${orderId}: ${previousStatus} -> ${status}`,
        );
      }
    } catch (error) {
      console.error('Failed to send status change notification:', error);
    }

    return updatedOrder;
  }
}
