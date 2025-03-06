import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { LessThan, Repository } from 'typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartEntity } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async addToCart(
    createCartDto: CreateCartDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<CartEntity> {
    const product = await this.productRepository.findOne({
      where: { id: createCartDto.product_id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stockAmount < createCartDto.quantity) {
      throw new BadRequestException('Product out of stock');
    }

    product.stockAmount -= createCartDto.quantity;
    product.holdAmount += createCartDto.quantity;
    await this.productRepository.save(product);

    delete createCartDto.product_id;

    const cartItem = this.cartRepository.create({
      ...createCartDto,
      price: product.discountPrice,
      user: { id: jwtPayload.id },
      product,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      created_by: jwtPayload.id,
      created_user_name: jwtPayload.userName,
      created_at: new Date(),
    });

    return await this.cartRepository.save(cartItem);
  }

  async removeFromCart(cartId: string, quantity?: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['product'],
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productRepository.findOne({
      where: { id: cartItem.product.id },
    });

    if (!quantity || quantity >= cartItem.quantity) {
      product.stockAmount += cartItem.quantity;
      product.holdAmount -= cartItem.quantity;
      await this.productRepository.save(product);
      await this.cartRepository.delete(cartId);
    } else {
      cartItem.quantity -= quantity;
      product.stockAmount += quantity;
      product.holdAmount -= quantity;
      await this.productRepository.save(product);
      await this.cartRepository.save(cartItem);
    }
  }

  async clearCart(jwtPayload: JwtPayloadInterface): Promise<void> {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: jwtPayload.id } },
      relations: ['product'],
    });

    for (const cartItem of cartItems) {
      const product = await this.productRepository.findOne({
        where: { id: cartItem.product.id },
      });
      product.stockAmount += cartItem.quantity;
      product.holdAmount -= cartItem.quantity;
      await this.productRepository.save(product);
    }

    await this.cartRepository.delete({ user: { id: jwtPayload.id } });
  }

  async clearExpiredCarts(): Promise<void> {
    const expiredCarts = await this.cartRepository.find({
      where: { expiresAt: LessThan(new Date()), is_active:ActiveStatusEnum.ACTIVE },
      relations: ['product'],
    });

    if (expiredCarts.length === 0) {
      return;
    }

    for (const cart of expiredCarts) {
      const product = await this.productRepository.findOne({
        where: { id: cart.product.id },
      });
      if (product) {
        product.stockAmount += cart.quantity;
        product.holdAmount -= cart.quantity;
        await this.productRepository.save(product);
      }
      cart.is_active = ActiveStatusEnum.INACTIVE;
      await this.cartRepository.save(cart);
    }
  }

  @Cron('*/15 * * * *')
  async handleClearExpiredCarts() {
    await this.clearExpiredCarts();
  }
}
