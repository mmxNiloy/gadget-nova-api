import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { BrandService } from 'src/brand/brand.service';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { CategoryService } from 'src/category/category.service';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { CouponTypeEnum } from 'src/common/enums/coupon-type.enum';
import { CouponUsageTypeEnum } from 'src/common/enums/coupon-usage-type.enum';
import { ProductsService } from 'src/products/products/products.service';
import { Repository } from 'typeorm';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponUsageEntity } from './entities/coupon-usage.entity';
import { CouponEntity } from './entities/coupon.entity';

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  message?: string;
  coupon?: CouponEntity;
}

export interface CouponApplicationResult {
  success: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
  coupon?: CouponEntity;
}

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(CouponUsageEntity)
    private readonly couponUsageRepository: Repository<CouponUsageEntity>,
    @InjectRepository(CouponEntity)
    private readonly cartRepository: Repository<CartEntity>,
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
  ) {}

  async create(
    createCouponDto: CreateCouponDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<CouponEntity> {
    try {
      // Check if coupon code already exists
      const existingCoupon = await this.couponRepository.findOne({
        where: { couponCode: createCouponDto.couponCode },
      });

      if (existingCoupon) {
        throw new BadRequestException('Coupon code already exists');
      }

      if (
        createCouponDto.couponUsageType === CouponUsageTypeEnum.SINGLE_USAGE &&
        createCouponDto.usageLimitPerUser > 1
      ) {
        throw new BadRequestException(
          'You cannot set Usage Limit Per User more than 1 for SINGLE USAGE type',
        );
      }

      // Validate dates
      const startDate = new Date(createCouponDto.startDate);
      const endDate = new Date(createCouponDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      const coupon = this.couponRepository.create({
        ...createCouponDto,
        startDate,
        endDate,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      if (
        createCouponDto.applicableProductIds &&
        createCouponDto.applicableProductIds.length > 0
      ) {
        const products = await this.productsService.findManyByIds(
          createCouponDto.applicableProductIds,
        );
        coupon.applicableProducts = products;
      }

      if (
        createCouponDto.applicableCategoryIds &&
        createCouponDto.applicableCategoryIds.length > 0
      ) {
        const categories = await this.categoryService.findManyByIds(
          createCouponDto.applicableCategoryIds,
        );
        coupon.applicableCategories = categories;
      }

      if (
        createCouponDto.applicableSubCategoryIds &&
        createCouponDto.applicableSubCategoryIds.length > 0
      ) {
        const subCategories = await this.categoryService.findManyByIds(
          createCouponDto.applicableSubCategoryIds,
        );
        coupon.applicableSubCategories = subCategories;
      }

      if (
        createCouponDto.applicableBrandIds &&
        createCouponDto.applicableBrandIds.length > 0
      ) {
        const brands = await this.brandService.findManyByIds(
          createCouponDto.applicableBrandIds,
        );
        coupon.applicableBrands = brands;
      }

      return await this.couponRepository.save(coupon);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<CouponEntity[]> {
    try {
      return await this.couponRepository.find({
        where: { is_active: ActiveStatusEnum.ACTIVE },
        order: { created_at: 'DESC' },
        relations: [
          'applicableProducts',
          'applicableCategories',
          'applicableSubCategories',
          'applicableBrands',
        ],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<CouponEntity> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { id, is_active: ActiveStatusEnum.ACTIVE },
        relations: [
          'applicableProducts',
          'applicableCategories',
          'applicableSubCategories',
          'applicableBrands',
        ],
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found');
      }

      return coupon;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch coupon');
    }
  }

  async findByCode(code: string): Promise<CouponEntity> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { couponCode: code, is_active: ActiveStatusEnum.ACTIVE },
        relations: [
          'applicableProducts',
          'applicableCategories',
          'applicableSubCategories',
          'applicableBrands',
        ],
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found');
      }

      return coupon;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch coupon');
    }
  }

  async update(
    id: string,
    updateData: Partial<CreateCouponDto>,
    jwtPayload: JwtPayloadInterface,
  ): Promise<CouponEntity> {
    try {
      const coupon = await this.findOne(id);

      if (
        updateData.couponUsageType !== undefined &&
        updateData.couponUsageType === CouponUsageTypeEnum.SINGLE_USAGE &&
        updateData.usageLimitPerUser !== undefined &&
        updateData.usageLimitPerUser > 1
      ) {
        throw new BadRequestException(
          'You cannot set Usage Limit Per User more than 1 for SINGLE USAGE type',
        );
      }

      if (
        updateData.applicableProductIds &&
        updateData.applicableProductIds.length > 0
      ) {
        const products = await this.productsService.findManyByIds(
          updateData.applicableProductIds,
        );
        coupon.applicableProducts = products;
      }

      if (
        updateData.applicableCategoryIds &&
        updateData.applicableCategoryIds.length > 0
      ) {
        const categories = await this.categoryService.findManyByIds(
          updateData.applicableCategoryIds,
        );
        coupon.applicableCategories = categories;
      }

      if (
        updateData.applicableSubCategoryIds &&
        updateData.applicableSubCategoryIds.length > 0
      ) {
        const subCategories = await this.categoryService.findManyByIds(
          updateData.applicableSubCategoryIds,
        );
        coupon.applicableSubCategories = subCategories;
      }

      if (
        updateData.applicableBrandIds &&
        updateData.applicableBrandIds.length > 0
      ) {
        const brands = await this.brandService.findManyByIds(
          updateData.applicableBrandIds,
        );
        coupon.applicableBrands = brands;
      }

      Object.assign(coupon, {
        ...updateData,
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
        updated_at: new Date(),
      });

      return await this.couponRepository.save(coupon);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update coupon');
    }
  }

  async delete(id: string, jwtPayload: JwtPayloadInterface): Promise<void> {
    try {
      const coupon = await this.findOne(id);

      coupon.is_active = ActiveStatusEnum.INACTIVE;
      coupon.updated_by = jwtPayload.id;
      coupon.updated_user_name = jwtPayload.userName;
      coupon.updated_at = new Date();

      await this.couponRepository.save(coupon);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to soft delete coupon');
    }
  }

  async verifyCoupon(userId: string, dto: ApplyCouponDto) {
    const coupon = await this.couponRepository.findOne({
      where: { couponCode: dto.couponCode, is_active: ActiveStatusEnum.ACTIVE },
      relations: [
        'applicableProducts',
        'applicableCategories',
        'applicableSubCategories',
        'applicableBrands',
        'usages',
      ],
    });
  
    if (!coupon) throw new BadRequestException('Coupon not found');
  
    const now = new Date();
    if (coupon.startDate > now || coupon.endDate < now) {
      throw new BadRequestException('Coupon is not valid at this time');
    }
  
    // Per-user usage check
    let userUsage = await this.couponUsageRepository.findOne({
      where: { coupon: { id: coupon.id }, user: { id: userId } },
    });
    if (!userUsage) {
      userUsage = this.couponUsageRepository.create({
        coupon,
        user: { id: userId },
        usageCount: 0,
      });
    }
    if (userUsage.usageCount >= coupon.usageLimitPerUser) {
      throw new BadRequestException('You have reached usage limit for this coupon');
    }
  
    // Fetch cart
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, is_active: ActiveStatusEnum.ACTIVE },
      relations: [
        'items',
        'items.product',
        'items.product.category',
        'items.product.subCategory',
        'items.product.brand',
      ],
    });
    if (!cart || !cart.items.length) throw new BadRequestException('Cart is empty');
  
    let totalDiscount = 0;
  
    // If coupon is for delivery charge only
    if (coupon.couponType === CouponTypeEnum.DELIVERY_CHARGE) {
      if (coupon.couponValue) {
        totalDiscount = coupon.couponValue; // flat discount on delivery charge
        if (coupon.maximumDiscountLimit) {
          totalDiscount = Math.min(totalDiscount, coupon.maximumDiscountLimit);
        }
      }
      coupon.applyCount += 1;
      await this.couponRepository.save(coupon);
  
      return {
        totalDiscount,
        finalTotal: null, // final product total not changed here
        appliesTo: 'DELIVERY_CHARGE'
      };
    }
  
    // Otherwise — Product or subtotal based discount
    const isGlobal =
      !coupon.applicableProducts?.length &&
      !coupon.applicableCategories?.length &&
      !coupon.applicableSubCategories?.length &&
      !coupon.applicableBrands?.length;
  
    cart.items.forEach((item) => {
      const product = item.product;
      const productTotalPrice = Number(item.price) * item.quantity;
  
      const applicable =
        isGlobal ||
        coupon.applicableProducts?.some((p) => p.id === product.id) ||
        coupon.applicableCategories?.some((c) => c.id === product.category?.id) ||
        coupon.applicableSubCategories?.some((sc) => sc.id === product.subCategory?.id) ||
        coupon.applicableBrands?.some((b) => b.id === product.brand?.id);
  
      if (applicable) {
        let discountPerItem = 0;
  
        if (coupon.couponType === CouponTypeEnum.FLAT) {
          discountPerItem = coupon.couponValue * item.quantity;
        } else if (coupon.couponType === CouponTypeEnum.PERCENTAGE) {
          discountPerItem = (productTotalPrice * coupon.couponValue) / 100;
        }
  
        if (coupon.maximumDiscountLimit) {
          discountPerItem = Math.min(discountPerItem, coupon.maximumDiscountLimit);
        }
  
        totalDiscount += discountPerItem;
        coupon.applyCount += 1;
      }
    });
  
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  
    const finalTotal = subtotal - totalDiscount;
  
    await this.couponRepository.save(coupon);
  
    return { totalDiscount, finalTotal, appliesTo: 'PRODUCTS' };
  }
  

  async redeemCoupon(userId: string, couponCode: string) {
    const coupon = await this.couponRepository.findOne({
      where: { couponCode },
    });
    if (!coupon) throw new BadRequestException('Coupon not found');

    // Increase redeemCount
    coupon.redeemCount += 1;
    await this.couponRepository.save(coupon);

    // Track per-user usage
    let usage = await this.couponUsageRepository.findOne({
      where: { coupon: { id: coupon.id }, user: { id: userId } },
    });
    if (!usage) {
      usage = this.couponUsageRepository.create({
        coupon,
        user: { id: userId },
        usageCount: 1,
      });
    } else {
      if (usage.usageCount >= coupon.usageLimitPerUser) {
        throw new BadRequestException('Usage limit exceeded for this coupon');
      }
      usage.usageCount += 1;
    }

    await this.couponUsageRepository.save(usage);

    return { message: 'Coupon redeemed successfully', couponCode };
  }

  async getUserCoupons(userId: string): Promise<CouponEntity[]> {
    const now = new Date();

    return await this.couponRepository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.applicableProducts', 'products')
      .leftJoinAndSelect('coupon.applicableCategories', 'categories')
      .leftJoinAndSelect('coupon.applicableSubCategories', 'subCategories')
      .leftJoinAndSelect('coupon.applicableBrands', 'brands')
      .leftJoinAndSelect('coupon.usages', 'usage', 'usage.user_id = :userId', {
        userId,
      })
      .where('coupon.is_active = :isActive', {
        isActive: ActiveStatusEnum.ACTIVE,
      })
      .andWhere('coupon.start_date <= :now', { now })
      .andWhere('coupon.end_date >= :now', { now })
      .andWhere(
        '(usage.usageCount IS NULL OR usage.usageCount < coupon.usageLimitPerUser)',
      )
      .getMany();
  }
}
