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
import { CartItemEntity } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepo: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async addToCart(dto: CreateCartDto, jwt: JwtPayloadInterface): Promise<CartEntity> {
    const product = await this.productRepo.findOne({ where: { id: dto.product_id } });
    if (!product || product.stockAmount < dto.quantity) {
      throw new BadRequestException('Product unavailable');
    }

    let cart = await this.cartRepo.findOne({
      where: {
        user: { id: jwt.id },
        is_active: ActiveStatusEnum.ACTIVE,
      },
      relations: ['items'],
    });

    

    // Create a new cart if not exists
    if (!cart) {
      cart = this.cartRepo.create({
        user: { id: jwt.id },
        is_active: ActiveStatusEnum.ACTIVE,
        created_by: jwt.id,
        created_user_name: jwt.userName,
      });
      cart = await this.cartRepo.save(cart);
    }


    console.log("🔥🔥🔥🔥🔥");

    let cartItem = await this.cartItemRepo.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: product.id },
      },
    });

    if (cartItem) {
      cartItem.quantity += dto.quantity;
    } else {
      cartItem = this.cartItemRepo.create({
        cart,
        product,
        quantity: dto.quantity,
        price: product.discountPrice,
      });
    }

    product.stockAmount -= dto.quantity;
    product.holdAmount += dto.quantity;
    await this.productRepo.save(product);
    await this.cartItemRepo.save(cartItem);

    return this.cartRepo.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
  }

  async removeFromCartItem(itemId: string, quantity?: number): Promise<void> {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['product'],
    });
    if (!item) throw new NotFoundException('Cart item not found');

    const product = item.product;

    if (!quantity || quantity >= item.quantity) {
      product.stockAmount += item.quantity;
      product.holdAmount -= item.quantity;
      await this.cartItemRepo.remove(item);
    } else {
      item.quantity -= quantity;
      product.stockAmount += quantity;
      product.holdAmount -= quantity;
      await this.cartItemRepo.save(item);
    }

    await this.productRepo.save(product);
  }

  async updateCartItemQuantity(
    itemId: string,
    newQuantity: number,
    jwt: JwtPayloadInterface,
  ): Promise<CartItemEntity> {
    if (newQuantity <= 0) throw new BadRequestException('Invalid quantity');

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
      relations: ['product', 'cart'],
    });
    if (!item) throw new NotFoundException('Cart item not found');

    const product = item.product;
    const diff = newQuantity - item.quantity;

    if (diff > 0) {
      if (product.stockAmount < diff) throw new BadRequestException('Insufficient stock');
      product.stockAmount -= diff;
      product.holdAmount += diff;
    } else {
      product.stockAmount += Math.abs(diff);
      product.holdAmount -= Math.abs(diff);
    }

    item.quantity = newQuantity;
    await this.productRepo.save(product);
    return await this.cartItemRepo.save(item);
  }

  async getActiveCart(userId: string): Promise<CartEntity> {
    return await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        is_active: ActiveStatusEnum.ACTIVE,
      },
      relations: ['items', 'items.product'],
    });
  }

  async deactivateActiveCart(userId: string): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        is_active: ActiveStatusEnum.ACTIVE,
      },
      relations: ['items', 'items.product'],
    });

    if (!cart) return;

    for (const item of cart.items) {
      item.product.stockAmount += item.quantity;
      item.product.holdAmount -= item.quantity;
      await this.productRepo.save(item.product);
    }

    cart.is_active = ActiveStatusEnum.INACTIVE;
    await this.cartRepo.save(cart);
  }
}
