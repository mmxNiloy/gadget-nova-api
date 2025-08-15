import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ProductsService } from 'src/products/products/products.service';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WishlistService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // 1️⃣ Add product
  async create(productId: string, jwtPayload: JwtPayloadInterface) {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');

    const user = await this.userRepository.findOne({
      where: { id: jwtPayload.id },
      relations: ['wishlist'],
    });

    if (!user.wishlist.find((p) => p.id === product.id)) {
      user.wishlist.push(product);
      await this.userRepository.save(user);
    }

    return user.wishlist;
  }

  // 2️⃣ Remove product
  async remove(productId: string, jwtPayload: JwtPayloadInterface) {
    const user = await this.userRepository.findOne({
      where: { id: jwtPayload.id },
      relations: ['wishlist'],
    });

    const index = user.wishlist.findIndex((p) => p.id === productId);
    if (index === -1) throw new NotFoundException('Product not in wishlist');

    user.wishlist.splice(index, 1);
    await this.userRepository.save(user);
    return user.wishlist;
  }

  async getUserWishlistPaginated(
    jwtPayload: JwtPayloadInterface,
    page: number,
    limit: number,
    sort: 'ASC' | 'DESC' = 'DESC',
    order: string = 'updated_at',
  ) {
    const orderFields = ['name', 'created_at', 'updated_at'];
    order = orderFields.includes(order) ? order : 'updated_at';
    sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wishlist', 'product')
      .where('user.id = :userId', { userId: jwtPayload.id })
      .orderBy(`product.${order}`, sort)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const user = users[0];

    return [user?.wishlist || [], total];
  }

  async getWishlisersByProduct(productId: string) {
    const product =
      await this.productsService.getWishlisersByProduct(productId);

    if (!product) throw new NotFoundException('Product not found');

    return product.wishlistedBy;
  }
}
