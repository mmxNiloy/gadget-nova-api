import { BrandEntity } from 'src/brand/entities/brand.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProductQuestionsEntity } from './product-questions.entity';
import { ProductRatingEntity } from './product-rating.entity';
import { ProductAttributeEntity } from './product-attribute.entity';

@Entity('products')
export class ProductEntity extends CustomBaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    default: 'product_slug',
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'product_meta_title',
  })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ name: 'productCode', type: 'varchar', length: 255 })
  productCode: string;

  @Column({ name: 'regularPrice', type: 'decimal', precision: 10, scale: 2 })
  regularPrice: number;

  @Column({
    name: 'discountPrice',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  discountPrice: number;

  @Column({ name: 'quantity', type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'keyFeatures', type: 'text' })
  keyFeatures: string;

  @Column({ name: 'stockAmount', type: 'int', default: 0 })
  stockAmount: number;

  @Column({ name: 'holdAmount', type: 'int', default: 0 })
  holdAmount: number;

  @Column({ name: 'soldAmount', type: 'int', default: 0 })
  soldAmount: number;

  @Column({ name: 'thresholdAMount', type: 'int', default: 3 })
  thresholdAMount: number;

  @Column({ name: 'thumbnail', type: 'varchar', nullable: true })
  thumbnail: string;

  @Column({ name: 'gallery', type: 'simple-array', nullable: true })
  gallery: string[];

  @Column({ name: 'specifications', type: 'text', nullable: true })
  specifications: string;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => BrandEntity, (brand) => brand.products, { eager: true })
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  @OneToMany(
    () => ProductQuestionsEntity,
    (productQuestionsEntity) => productQuestionsEntity.product,
  )
  questions: ProductQuestionsEntity[];

  @OneToMany(
    () => ProductRatingEntity,
    (productRatingEntity) => productRatingEntity.product,
  )
  ratings: ProductRatingEntity[];

  @OneToMany(
    () => ProductAttributeEntity,
    (productAttribute) => productAttribute.product,
  )
  productAttributes: ProductAttributeEntity[];
}
