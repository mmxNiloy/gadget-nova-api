import { BrandEntity } from 'src/brand/entities/brand.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductQuestionsEntity } from './product-questions.entity';

@Entity('products')
export class ProductEntity extends CustomBaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

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

  @Column({ name: 'keyFeatures', type: 'text'})
  keyFeatures: string;

  @Column({ name:"specifications",type: 'json', nullable: true })
  specifications: Record<string, any>;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => BrandEntity, (brand) => brand.products, { eager: true })
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  @OneToMany(() => ProductQuestionsEntity, (productQuestionsEntity) => productQuestionsEntity.product)
  questions: ProductQuestionsEntity[];
}
