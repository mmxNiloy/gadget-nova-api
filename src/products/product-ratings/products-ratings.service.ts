import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { CreateProductRatingsDto } from '../dto/create-product-rating.dto';
import { ProductRatingEntity } from '../entities/product-rating.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ProductsRatingsService {
  constructor(
    @InjectRepository(ProductRatingEntity)
    private readonly productRatingsRepository: Repository<ProductRatingEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createProductRatingsDto: CreateProductRatingsDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductRatingEntity> {
    try {
      const product = await this.productsService.findOne(
        createProductRatingsDto.product_id,
      );

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if user has already rated this product
      const existingRating = await this.productRatingsRepository.findOne({
        where: {
          product: { id: createProductRatingsDto.product_id },
          created_by: jwtPayload.id,
          is_active: ActiveStatusEnum.ACTIVE,
        },
      });

      if (existingRating) {
        throw new BadRequestException('You have already rated this product');
      }

      delete createProductRatingsDto.product_id;

      const productRatingEntity = this.productRatingsRepository.create({
        ...createProductRatingsDto,
        product: product,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      return await this.productRatingsRepository.save(productRatingEntity);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<ProductRatingEntity> {
    const rating = await this.productRatingsRepository.findOne({
      where: { id, is_active: ActiveStatusEnum.ACTIVE },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  async findRatingsByProduct(id: string): Promise<ProductRatingEntity[]> {
    const ratings = await this.productRatingsRepository.find({
      where: { product: { id: id }, is_active: ActiveStatusEnum.ACTIVE },
    });

    return ratings;
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductRatingEntity> {
    const rating = await this.findOne(id);

    rating.is_active = ActiveStatusEnum.INACTIVE;
    rating.updated_by = jwtPayload.id;
    rating.updated_user_name = jwtPayload.userName;
    rating.updated_at = new Date();

    return await this.productRatingsRepository.save(rating);
  }

  async getProductRatingWithUserInfo(
    productId: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<{
    allRatings: ProductRatingEntity[];
    userRating?: ProductRatingEntity;
  }> {
    const allRatings = await this.productRatingsRepository.find({
      where: { product: { id: productId }, is_active: ActiveStatusEnum.ACTIVE },
      order: { created_at: 'DESC' },
    });

    const userRating = await this.productRatingsRepository.findOne({
      where: {
        product: { id: productId },
        created_by: jwtPayload.id,
        is_active: ActiveStatusEnum.ACTIVE,
      },
    });

    return { allRatings, userRating };
  }
}
