import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePromotionalDiscountDto,
  PromotionSearchDto,
} from './dto/create-promotional-discount.dto';
import { UpdatePromotionalDiscountDto } from './dto/update-promotional-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionalDiscountEntity } from './entities/promotional-discount.entity';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { ProductsService } from 'src/products/products/products.service';

@Injectable()
export class PromotionalDiscountService {
  constructor(
    @InjectRepository(PromotionalDiscountEntity)
    private readonly promoDiscountRepository: Repository<PromotionalDiscountEntity>,
    private readonly productService: ProductsService,
  ) {}

  async create(
    createPromotionalDiscountDto: CreatePromotionalDiscountDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<PromotionalDiscountEntity> {
    try {
      const product = createPromotionalDiscountDto.product_id
        ? await this.productService.findOne(
            createPromotionalDiscountDto.product_id,
          )
        : null;

      const promotionalEntity = this.promoDiscountRepository.create({
        ...createPromotionalDiscountDto,
        product: product,
        created_at: new Date(),
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
      });

      return await this.promoDiscountRepository.save(promotionalEntity);
    } catch (error) {
      console.log(error);

      throw new BadRequestException(error.response?.message);
    }
  }

  async findAll(title?: string): Promise<PromotionalDiscountEntity[]> {
    try {
      const query = this.promoDiscountRepository
        .createQueryBuilder('promoDiscount')
        .leftJoinAndSelect('promoDiscount.product', 'product')
        .where('promoDiscount.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        });

      if (title) {
        query.andWhere('LOWER(product.title) LIKE :title', {
          title: `%${title.toLowerCase()}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    promotionSearchDto: PromotionSearchDto,
  ) {
    try {
      const query = this.promoDiscountRepository
        .createQueryBuilder('promoDiscount')
        .where('promoDiscount.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .leftJoinAndSelect('promoDiscount.product', 'product');

      if (promotionSearchDto.title) {
        query.andWhere('LOWER(product.title) LIKE :title', {
          title: `%${promotionSearchDto.title.toLowerCase()}%`,
        });
      }

      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';

      query
        .orderBy(`promoDiscount.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);

      const [promoDiscounts, total] = await query.getManyAndCount();

      return [promoDiscounts, total];
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching promoDiscounts',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<PromotionalDiscountEntity> {
    try {
      const promoDiscount = await this.promoDiscountRepository
        .createQueryBuilder('promoDiscount')
        .leftJoinAndSelect('promoDiscount.product', 'product')
        .where('promoDiscount.id = :id', { id })
        .andWhere('promoDiscount.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .getOne();

      if (!promoDiscount) {
        throw new NotFoundException('promoDiscount Not found');
      }

      return promoDiscount;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.message || 'Failed to retrieve promotion',
      );
    }
  }

  async update(
    id: string,
    updatePromotionalDiscountDto: UpdatePromotionalDiscountDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<PromotionalDiscountEntity> {
    try {
      const promoDiscount = await this.findOne(id);

      if (updatePromotionalDiscountDto.product_id) {
        promoDiscount.product = await this.productService.findOne(
          updatePromotionalDiscountDto.product_id,
        );
      }

      const updatedPromotion = {
        ...promoDiscount,
        ...updatePromotionalDiscountDto,
        updated_at: new Date(),
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
      };

      return await this.promoDiscountRepository.save(updatedPromotion);
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<PromotionalDiscountEntity> {
    try {
      const promoDiscount = await this.findOne(id);

      const updatedPromoDiscount = {
        ...promoDiscount,
        is_active: ActiveStatusEnum.INACTIVE,
        updated_by: jwtPayload.id,
        updated_at: new Date(),
        updated_user_name: jwtPayload.userName,
      };

      const deleted: PromotionalDiscountEntity =
        await this.promoDiscountRepository.save(updatedPromoDiscount);

      return deleted;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
