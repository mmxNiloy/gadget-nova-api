import { IsEmail, IsNotEmpty } from 'class-validator';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { OrderEntity } from 'src/order/entities/order.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: '50' })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index({ unique: true })
  @IsEmail()
  email: string;

  @Column({
    type: 'varchar',
    name: 'password',
    length: 100,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @Column({
    type: 'varchar',
    name: 'verification_token',
    length: 1000,
    nullable: true,
  })
  @Index({ unique: true })
  verification_token: string;

  @Column({
    type: 'varchar',
    name: 'refresh_token',
    length: 1000,
    nullable: true,
  })
  @Index({ unique: true })
  refresh_token: string;

  @Column({
    type: 'varchar',
    name: 'reset_password_token',
    length: 1000,
    nullable: true,
  })
  @Index({ unique: true })
  reset_password_token: string;

  @OneToMany(() => CartEntity, (cartEntity) => cartEntity.user)
  carts: CartEntity[];

  @OneToMany(() => OrderEntity, (orderEntity) => orderEntity.user)
  orders: OrderEntity[];
}
