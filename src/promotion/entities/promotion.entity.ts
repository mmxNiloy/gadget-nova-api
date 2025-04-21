import { CustomBaseEntity } from "src/common/common-entities/custom-base.enity";
import { ProductEntity } from "src/products/entities/product.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('promotions')
export class PromotionEntity extends CustomBaseEntity {
  @Column({name:"title", type: 'varchar', length: 255, nullable: false, default: "brand_meta_title" })
  title: string;

  @Column({name:"subTitle", type: 'varchar', length: 255, nullable: true, default: "brand_meta_title" })
  subTitle: string;

  @Column({ name: 'promotionImage', type: 'varchar', nullable: false })
  promotionImage: string;

  @Column({ name: 'startDate', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable:false })
  startDate: Date;

  @Column({ name: 'endDate', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable:false })
  endDate: Date;

  @ManyToOne(() => ProductEntity, (product) => product.promotions, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
