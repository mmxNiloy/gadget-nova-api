import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { OrderSearchDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { RolesEnum } from 'src/common/enums/roles.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,  
  ) {}

  async createOrder(
    jwtPayload: JwtPayloadInterface,
  ): Promise<OrderEntity> {
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
  
    let calculatedTotalPrice = 0;
    for (const item of cart.items) {
      const product = item.product;
  
      if (product.stockAmount < item.quantity) {
        throw new BadRequestException(`Not enough stock for product: ${product.title}`);
      }
  
      calculatedTotalPrice += product.discountPrice * item.quantity;
    }
  
    let totalPrice = 0;
    for (const item of cart.items) {
      const product = item.product;
  
      totalPrice += item.price * item.quantity;
    }
  
    if (calculatedTotalPrice !== totalPrice) {
      cart.items = [];
      cart.is_active = ActiveStatusEnum.INACTIVE;
      await this.cartRepository.save(cart);
  
      throw new BadRequestException({
        code: 'ORDER_PRICE_MISMATCH',
        message: 'Product prices have changed. Cart has been cleared. Please create a new order.',
        updatedTotalPrice: calculatedTotalPrice,
      });
    }
  
    const order = this.orderRepository.create({
      user: { id: jwtPayload.id },
      cart,
      totalPrice,
      status: OrderStatus.PENDING,
      created_by: jwtPayload.id,
      created_user_name: jwtPayload.userName,
      created_at: new Date(),
    });
  
    const savedOrder = await this.orderRepository.save(order);
  
    for (const item of cart.items) {
      const product = item.product;
      product.stockAmount -= item.quantity;
      product.holdAmount -= item.quantity;
      await this.productRepository.save(product);
    }
  
    cart.is_active = ActiveStatusEnum.INACTIVE;
    await this.cartRepository.save(cart);
  
    return savedOrder;
  }
  
  

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    orderSearchDto: OrderSearchDto,
    jwtPayload: JwtPayloadInterface
  ) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect('orders.cart', 'cart')
        .leftJoinAndSelect('cart.items', 'items')
        .leftJoinAndSelect('items.product', 'product');

        if (jwtPayload.role === RolesEnum.USER) {
          query.where('orders.userId = :userId', { userId: jwtPayload.id });
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
      throw new BadRequestException({
        message: 'Error fetching orders',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository
    .createQueryBuilder('orders')
    .where('orders.id = :id', { id })
    .leftJoinAndSelect('orders.user', 'user')
    .leftJoinAndSelect('orders.cart', 'cart')
    .leftJoinAndSelect('cart.items', 'items')
    .leftJoinAndSelect('items.product', 'product')
    .getOne();

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
      relations: ['cart'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
  }
}
