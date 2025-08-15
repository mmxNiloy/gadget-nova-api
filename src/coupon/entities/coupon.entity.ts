import { BrandEntity } from 'src/brand/entities/brand.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { CouponTypeEnum } from 'src/common/enums/coupon-type.enum';
import { CouponUsageTypeEnum } from 'src/common/enums/coupon-usage-type.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CouponUsageEntity } from './coupon-usage.entity';

@Entity('coupons')
export class CouponEntity extends CustomBaseEntity {
  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  couponCode: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'coupon_type', type: 'enum', enum: CouponTypeEnum })
  couponType: CouponTypeEnum;

  @Column({ name: 'coupon_value', type: 'decimal', precision: 10, scale: 2 })
  couponValue: number;

  @Column({ name: 'max_discount_limit', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountLimit: number;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumOrderAmount: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'usage_limit_per_user', type: 'int', default: 1 })
  usageLimitPerUser: number;

  @Column({ name: 'apply_count', type: 'int', default: 0 })
  applyCount: number;

  @Column({ name: 'redeem_count', type: 'int', default: 0 })
  redeemCount: number;

  @Column({
    type: 'enum',
    name: 'coupon_usage_type',
    enum: CouponUsageTypeEnum,
    nullable: false
  })
  couponUsageType: CouponUsageTypeEnum;

  @ManyToMany(() => ProductEntity, { nullable: true })
  @JoinTable({ name: 'coupon_products' })
  applicableProducts: ProductEntity[];

  @ManyToMany(() => CategoryEntity, { nullable: true })
  @JoinTable({ name: 'coupon_categories' })
  applicableCategories: CategoryEntity[];

  @ManyToMany(() => CategoryEntity, { nullable: true })
  @JoinTable({ name: 'coupon_sub_categories' })
  applicableSubCategories: CategoryEntity[];

  @ManyToMany(() => BrandEntity, { nullable: true })
  @JoinTable({ name: 'coupon_brands' })
  applicableBrands: BrandEntity[];

  @OneToMany(() => CouponUsageEntity, (usage) => usage.coupon)
  usages: CouponUsageEntity[];
}
