import { IsNotEmpty } from 'class-validator';
import { BrandEntity } from 'src/brand/entities/brand.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: '50' })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, default: "category_slug" })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: "category_meta_title" })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @ManyToMany(() => BrandEntity, (brand) => brand.categories)
  brands: BrandEntity[];

  @OneToMany(() => ProductEntity, (productEntity) => productEntity.category)
  products: ProductEntity[];
}
