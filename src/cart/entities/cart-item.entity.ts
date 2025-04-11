import { CustomBaseEntity } from "src/common/common-entities/custom-base.enity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CartEntity } from "./cart.entity";
import { ProductEntity } from "src/products/entities/product.entity";

@Entity('cart_item')
export class CartItemEntity extends CustomBaseEntity {
  @ManyToOne(() => CartEntity, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'price', type: 'decimal' })
  price: number;
}
