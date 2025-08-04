import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product-ratings')
@Unique(['created_by', 'product'])
export class ProductRatingEntity extends CustomBaseEntity {
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'star_count', type: 'int', default: 0, nullable: false })
  star_count: number;

  @ManyToOne(() => ProductEntity, (product) => product.ratings, {
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
