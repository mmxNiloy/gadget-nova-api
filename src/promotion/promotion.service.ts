import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ProductsService } from 'src/products/products/products.service';
import { S3Service } from 'src/s3/s3.service';
import { Repository } from 'typeorm';
import { CreatePromotionDto, PromotionSearchDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionEntity } from './entities/promotion.entity';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createPromotionDto: CreatePromotionDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<PromotionEntity> {
    try {
      const product = await this.productsService.findOne(
        createPromotionDto.product_id,
      );

      const imageUrl = createPromotionDto.promotionImage
        ? (
            await this.s3Service.uploadFile(
              createPromotionDto.promotionImage,
              'products/promotions',
            )
          ).Location
        : null;

      const promotionEntity = this.promotionRepository.create({
        ...createPromotionDto,
        product: product,
        promotionImage: imageUrl,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      const savedPromotion = await this.promotionRepository.save(promotionEntity);

      return savedPromotion;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const now = new Date();
  
      const promotions = await this.promotionRepository
        .createQueryBuilder('promotions')
        .leftJoinAndSelect('promotions.product', 'product')
        .where('promotions.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .andWhere('promotions.startDate <= :now', { now })
        .andWhere('promotions.endDate >= :now', { now })
        .getMany();
  
      return promotions;
    } catch (error) {
      throw new BadRequestException(error.message);
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
      const query = this.promotionRepository
        .createQueryBuilder('promotion')
        .leftJoinAndSelect('promotion.product', 'product')
        .where('promotion.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })


      if (promotionSearchDto.product_ids) {
        promotionSearchDto.product_ids = Array.isArray(promotionSearchDto.product_ids)
          ? promotionSearchDto.product_ids
          : [promotionSearchDto.product_ids];

        query.andWhere('product.id IN (:...product_ids)', {
          product_ids: promotionSearchDto.product_ids,
        });
      }
      
      if (promotionSearchDto.startDate) {
        query.andWhere('promotion.startDate >= :startDate', {
          startDate: promotionSearchDto.startDate,
        });
      }
      
      if (promotionSearchDto.endDate) {
        query.andWhere('promotion.endDate <= :endDate', {
          endDate: promotionSearchDto.endDate,
        });
      }

      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['title', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';

      query
        .orderBy(`promotion.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);

      const [promotions, total] = await query.getManyAndCount();

      
      return [promotions, total];
    } catch (error) {
      console.log(error);

      throw new BadRequestException({
        message: 'Error fetching promotions',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<PromotionEntity> {
    const promotion = await this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.product', 'product')
      .where('promotion.id = :id', { id })
      .andWhere('promotion.is_active = :status', {
        status: ActiveStatusEnum.ACTIVE,
      })
      .getOne();

    if (!promotion) {
      throw new NotFoundException('promotion not found');
    }
    return promotion
  }

  update(id: number, updatePromotionDto: UpdatePromotionDto) {
    return `This action updates a #${id} promotion`;
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<PromotionEntity> {
    const promotion = await this.findOne(id);

    promotion.is_active = ActiveStatusEnum.INACTIVE;
    promotion.updated_by = jwtPayload.id;
    promotion.updated_user_name = jwtPayload.userName;
    promotion.updated_at = new Date();

    return await this.promotionRepository.save(promotion);
  }
}
