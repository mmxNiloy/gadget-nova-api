import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderDto, OrderSearchDto } from './dto/create-order.dto';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<OrderEntity> {
    const carts = await this.cartRepository.find({
      where: { user: { id: jwtPayload.id }, order: null },
      relations: ['product'],
    });

    if (!carts.length) {
      throw new NotFoundException('No valid carts found for order placement');
    }

    for (const cart of carts) {
      if (cart.user.id !== jwtPayload.id) {
        throw new BadRequestException(
          "Cannot place an order for another user's cart",
        );
      }

      const existingOrder = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.carts', 'cart')
        .where('cart.id = :cartId', { cartId: cart.id })
        .getOne();

      if (existingOrder) {
        throw new BadRequestException(`You have already ordered`);
      }
    }

    const totalPrice = carts.reduce(
      (sum, cart) => sum + cart.price * cart.quantity,
      0,
    );

    const order = this.orderRepository.create({
      user: { id: jwtPayload.id },
      carts,
      totalPrice,
      status: OrderStatus.PENDING,
      created_by: jwtPayload.id,
      created_user_name: jwtPayload.userName,
      created_at: new Date(),
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const cart of carts) {
      cart.order = savedOrder;
      cart.is_active = ActiveStatusEnum.INACTIVE;
      await this.cartRepository.save(cart);
    }

    return savedOrder;
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    orderSearchDto: OrderSearchDto,
  ) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.user', 'user')
        .leftJoinAndSelect('orders.carts', 'carts')
        .leftJoinAndSelect('carts.product', 'product');

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

      const [brands, total] = await query.getManyAndCount();

      return [brands, total];
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching orders',
        details: error.message,
      });
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['carts'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
  }
}
