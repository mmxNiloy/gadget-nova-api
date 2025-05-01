import { CartEntity } from 'src/cart/entities/cart.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ShippingInfoEntity } from 'src/shipping-info/entities/shipping-info.entity';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('orders')
export class OrderEntity extends CustomBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.orders, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToOne(() => CartEntity, { eager: true })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @OneToOne(() => ShippingInfoEntity, { eager: true })
  @JoinColumn({ name: 'shipping_id' })
  shippingInfo: ShippingInfoEntity;

  @Column({ name: 'status', type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'total_price', type: 'decimal' })
  totalPrice: number;
}
