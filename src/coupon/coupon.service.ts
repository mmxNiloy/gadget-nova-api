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
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/sms/sms.service';
import { Repository } from 'typeorm';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponUsageEntity } from './entities/coupon-usage.entity';
import { CouponEntity } from './entities/coupon.entity';
import { UserCouponDto } from './dto/user-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(CouponUsageEntity)
    private readonly couponUsageRepository: Repository<CouponUsageEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
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

      // For single usage coupons, validate user ID and check if user exists
      if (
        createCouponDto.couponUsageType === CouponUsageTypeEnum.SINGLE_USAGE
      ) {
        if (!createCouponDto.userId) {
          throw new BadRequestException(
            'User ID is required for single usage coupon',
          );
        }

        const user = await this.userService.getUserById(createCouponDto.userId);
        if (!user) {
          throw new BadRequestException(
            'User with the provided ID does not exist',
          );
        }
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

      const savedCoupon = await this.couponRepository.save(coupon);

      // Send notification for single usage coupons
      if (
        createCouponDto.couponUsageType === CouponUsageTypeEnum.SINGLE_USAGE &&
        createCouponDto.userId
      ) {
        try {
          await this.sendCouponNotification(
            createCouponDto.userId,
            savedCoupon,
          );
        } catch (notificationError) {
          // Log notification error but don't fail the coupon creation
          console.error(
            'Failed to send coupon notification:',
            notificationError,
          );
        }
      }

      return savedCoupon;
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
      throw new BadRequestException(
        'You have reached usage limit for this coupon',
      );
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
  
    if (!cart || !cart.items.length)
      throw new BadRequestException('Cart is empty');

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
        appliesTo: 'DELIVERY_CHARGE',
      };
    }

    // Otherwise — Product or subtotal based discount
    const isGlobal =
      !coupon.applicableProducts?.length &&
      !coupon.applicableCategories?.length &&
      !coupon.applicableSubCategories?.length &&
      !coupon.applicableBrands?.length;

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  
    // If global coupon → apply on subtotal
    if (isGlobal) {
      if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {

        throw new BadRequestException(
          `Coupon is applicable only for orders of at least ${coupon.minimumOrderAmount}`,
        );
      }
  
      if (coupon.couponType === CouponTypeEnum.FLAT) {
        totalDiscount = coupon.couponValue;
      } else if (coupon.couponType === CouponTypeEnum.PERCENTAGE) {
        totalDiscount = (subtotal * coupon.couponValue) / 100;
      }
  
      if (coupon.maximumDiscountLimit) {
        totalDiscount = Math.min(totalDiscount, coupon.maximumDiscountLimit);
      }
  
      coupon.applyCount += 1;
    } else {
      // Apply per applicable product
      cart.items.forEach((item) => {
        const product = item.product;
        const productTotalPrice = Number(item.price) * item.quantity;
  
        const applicable =
          coupon.applicableProducts?.some((p) => p.id === product.id) ||
          coupon.applicableCategories?.some((c) => c.id === product.category?.id) ||
          coupon.applicableSubCategories?.some(
            (sc) => sc.id === product.subCategory?.id,
          ) ||
          coupon.applicableBrands?.some((b) => b.id === product.brand?.id);
  
        if (applicable) {
          let discountPerItem = 0;
  
          if (coupon.couponType === CouponTypeEnum.FLAT) {
            discountPerItem = coupon.couponValue * item.quantity;
          } else if (coupon.couponType === CouponTypeEnum.PERCENTAGE) {
            discountPerItem = (productTotalPrice * coupon.couponValue) / 100;
          }
  
          if (coupon.maximumDiscountLimit) {
            discountPerItem = Math.min(
              discountPerItem,
              coupon.maximumDiscountLimit,
            );
          }
  
          totalDiscount += discountPerItem;
          coupon.applyCount += 1;
        }
      });
    }
  
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

  async getUserCoupons(userId: string): Promise<UserCouponDto[]> {
    const now = new Date();
  
    const coupons = await this.couponRepository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.applicableProducts', 'products')
      .leftJoinAndSelect('coupon.applicableCategories', 'categories')
      .leftJoinAndSelect('coupon.applicableSubCategories', 'subCategories')
      .leftJoinAndSelect('coupon.applicableBrands', 'brands')
      .leftJoinAndSelect('coupon.usages', 'usage', 'usage.user_id = :userId', { userId })
      .where('coupon.is_active = :isActive', { isActive: ActiveStatusEnum.ACTIVE })
      .andWhere('coupon.start_date <= :now', { now })
      .andWhere('coupon.end_date >= :now', { now })
      .andWhere('(usage.usageCount IS NULL OR usage.usageCount < coupon.usageLimitPerUser)')
      .getMany();
  
    return coupons.map((coupon) => {
      const usageCount = coupon.usages?.[0]?.usageCount ?? 0;
      return {
        ...coupon,
        remainingUsage: coupon.usageLimitPerUser - usageCount,
      };
    });
  }
  

  private async sendCouponNotification(
    userId: string,
    coupon: CouponEntity,
  ): Promise<void> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      console.error('User not found for sending coupon notification.');
      return;
    }

    // If user has email, send email
    if (user.email) {
      try {
        const subject = `🎉 Your Exclusive Coupon: ${coupon.couponCode}`;
        const htmlContent = this.generateCouponEmailHtml(coupon);

        await this.mailService.sendCouponEmail(
          user.email,
          subject,
          htmlContent,
        );
        console.log(`Coupon email sent successfully to ${user.email}`);
      } catch (error) {
        console.error('Failed to send coupon email:', error);
        // If email fails, try SMS as fallback
        await this.sendCouponSms(user.phone, coupon);
      }
    }
    // If user doesn't have email but has phone, send SMS
    else if (user.phone) {
      await this.sendCouponSms(user.phone, coupon);
    }
    // If user has neither email nor phone
    else {
      console.error(
        'User has no email or phone for sending coupon notification.',
      );
    }
  }

  private async sendCouponSms(
    phoneNumber: string,
    coupon: CouponEntity,
  ): Promise<void> {
    try {
      const message = this.generateCouponSmsMessage(coupon);
      const success = await this.smsService.sendSms(phoneNumber, message);

      if (success) {
        console.log(`Coupon SMS sent successfully to ${phoneNumber}`);
      } else {
        console.error('Failed to send coupon SMS');
      }
    } catch (error) {
      console.error('Error sending coupon SMS:', error);
    }
  }

  private generateCouponSmsMessage(coupon: CouponEntity): string {
    const discountText =
      coupon.couponType === CouponTypeEnum.PERCENTAGE
        ? `${coupon.couponValue}% OFF`
        : coupon.couponType === CouponTypeEnum.FLAT
          ? `$${coupon.couponValue} OFF`
          : 'FREE DELIVERY';

    const validityPeriod = `Valid from ${new Date(coupon.startDate).toLocaleDateString()} to ${new Date(coupon.endDate).toLocaleDateString()}`;

    return (
      `🎉 Your Exclusive Coupon: ${coupon.couponCode}\n\n` +
      `${discountText}\n` +
      `Min Order: $${coupon.minimumOrderAmount}\n` +
      `${validityPeriod}\n\n` +
      `Use this coupon code at checkout!\n` +
      `Thank you for choosing Gadget Nova!`
    );
  }

  private generateCouponEmailHtml(coupon: CouponEntity): string {
    const discountText =
      coupon.couponType === CouponTypeEnum.PERCENTAGE
        ? `${coupon.couponValue}% OFF`
        : coupon.couponType === CouponTypeEnum.FLAT
          ? `$${coupon.couponValue} OFF`
          : 'FREE DELIVERY';

    const validityPeriod = `Valid from ${new Date(coupon.startDate).toLocaleDateString()} to ${new Date(coupon.endDate).toLocaleDateString()}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Exclusive Coupon</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .coupon-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .coupon-code h2 { color: #667eea; margin: 0; font-size: 28px; letter-spacing: 2px; }
          .discount { background: #667eea; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .discount h3 { margin: 0; font-size: 24px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .details p { margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Exclusive Coupon Just For You!</h1>
            <p>We're excited to offer you this special discount!</p>
          </div>
          
          <div class="content">
            <div class="coupon-code">
              <h2>${coupon.couponCode}</h2>
            </div>
            
            <div class="discount">
              <h3>${discountText}</h3>
            </div>
            
            <div class="details">
              <p><strong>Description:</strong> ${coupon.description || 'Special discount just for you!'}</p>
              <p><strong>Minimum Order:</strong> $${coupon.minimumOrderAmount}</p>
              <p><strong>Validity:</strong> ${validityPeriod}</p>
              <p><strong>Usage Limit:</strong> ${coupon.usageLimitPerUser} time${coupon.usageLimitPerUser > 1 ? 's' : ''}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="#" class="cta">Shop Now & Use Coupon</a>
            </div>
            
            <div class="footer">
              <p>This coupon is exclusively created for you. Don't miss out on this amazing offer!</p>
              <p>Thank you for choosing Gadget Nova!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
