import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, jwtPayload:JwtPayloadInterface): Promise<OrderEntity> {
    const carts = await this.cartRepository.find({
      where: { user: { id: jwtPayload.id }, order: null },
      relations: ['product'],
    });

    if (!carts.length) {
      throw new NotFoundException('No valid carts found for order placement');
    }

    for (const cart of carts) {
      if (cart.user.id !== jwtPayload.id) {
        throw new BadRequestException('Cannot place an order for another user\'s cart');
      }
    }

    const totalPrice = carts.reduce((sum, cart) => sum + cart.price * cart.quantity, 0);

    const order = this.orderRepository.create({
      user: { id: jwtPayload.id },
      carts,
      totalPrice,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const cart of carts) {
      cart.order = savedOrder;
      await this.cartRepository.save(cart);
    }

    return savedOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderEntity> {
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
