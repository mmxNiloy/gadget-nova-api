import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Bool } from 'src/common/enums/bool.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('promotional_discount')
export class PromotionalDiscountEntity extends CustomBaseEntity {
  @Column({
    type: 'enum',
    name: 'is_percentage',
    enum: Bool,
  })
  is_percentage: Bool;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amount: number;

  @Column({
    type: 'timestamp',
    name: 'start_date',
    nullable: false,
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
    name: 'end_date',
    nullable: false,
  })
  endDate: Date;

  @ManyToOne(() => ProductEntity, (product) => product.promotionalDiscounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
