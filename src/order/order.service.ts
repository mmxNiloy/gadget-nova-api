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
    private readonly notificationService: NotificationService,
  ) {}

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

    const order = this.orderRepository.create({
      user: { id: jwtPayload.id },
      cart,
      shippingInfo,
      totalPrice: totalPrice + parseFloat(deliveryCharge.toString()),
      delivery_charge: deliveryCharge,
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
    console.log('Order saved successfully:', savedOrder.id);

    // Load user information for notifications
    const userWithContactInfo = await this.userRepository.findOne({
      where: { id: jwtPayload.id },
      select: ['id', 'email', 'phone'],
    });

    // Attach user contact info to the order for notifications
    savedOrder.user = userWithContactInfo;

    // Send order placed notification
    try {
      await this.notificationService.sendOrderPlacedNotification(savedOrder);
    } catch (error) {
      console.error('Failed to send order placed notification:', error);
    }

    // Update product stock and deactivate cart
    for (const item of cart.items) {
      const product = item.product;
      product.stockAmount -= item.quantity;
      product.holdAmount -= item.quantity;
      await this.productRepository.save(product);
    }

    cart.is_active = ActiveStatusEnum.INACTIVE;
    await this.cartRepository.save(cart);

    console.log('Payment method:', createOrderDto.paymentMethod);

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

      console.log('Returning COD order');
      return savedOrder;
    } else {
      console.log('Processing online payment:', createOrderDto.paymentMethod);
      // For bKash/SSL, create order with pending status and return payment URL
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
        .leftJoinAndSelect('orders.shippingInfo', 'shippingInfo')
        .leftJoinAndSelect('orders.cart', 'cart')
        .leftJoinAndSelect('cart.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('orders.shippingInfo.district', 'district');

      if (jwtPayload.role === RolesEnum.USER) {
        query.where('orders.user_id = :userId', { userId: jwtPayload.id });
      }

      if (orderSearchDto.name) {
        query.where('LOWER(user.name) LIKE :name', {
          name: `%${orderSearchDto.name.toLowerCase()}%`,
        });
      }

      if (orderSearchDto.status) {
        query.andWhere('orders.status = :status', {
          status: orderSearchDto.status,
        });
      }

      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';

      query
        .orderBy(`orders.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);

      const [orders, total] = await query.getManyAndCount();

      return [orders, total];
    } catch (error) {
      // console.log("Error fetching orders:", error);
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
      .leftJoinAndSelect('orders.shippingInfo', 'shippingInfo')
      .leftJoinAndSelect('orders.cart', 'cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('orders.shippingInfo.district', 'district');

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
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const previousStatus = order.status;
    order.status = status as OrderStatus;
    const updatedOrder = await this.orderRepository.save(order);

    // Send notifications based on status change
    try {
      if (
        status === OrderStatus.CANCELLED &&
        previousStatus !== OrderStatus.CANCELLED
      ) {
        await this.notificationService.sendOrderCancelledNotification(
          updatedOrder,
        );
      } else if (
        status === OrderStatus.CONFIRMED &&
        previousStatus !== OrderStatus.CONFIRMED
      ) {
        await this.notificationService.sendOrderConfirmedNotification(
          updatedOrder,
        );
      } else if (
        status === OrderStatus.ON_THE_WAY &&
        previousStatus !== OrderStatus.ON_THE_WAY
      ) {
        await this.notificationService.sendOrderShippedNotification(
          updatedOrder,
        );
      } else if (
        status === OrderStatus.ON_HOLD &&
        previousStatus !== OrderStatus.ON_HOLD
      ) {
        await this.notificationService.sendOrderOnHoldNotification(
          updatedOrder,
        );
      }
    } catch (error) {
      console.error('Failed to send status change notification:', error);
    }

    return updatedOrder;
  }
}
