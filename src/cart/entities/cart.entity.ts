import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity('cart')
export class CartEntity extends CustomBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.carts, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
