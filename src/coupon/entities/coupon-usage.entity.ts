import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { CouponEntity } from './coupon.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';

@Entity('coupon_usages')
export class CouponUsageEntity extends CustomBaseEntity{
  @ManyToOne(() => CouponEntity, (coupon) => coupon.usages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'int', default: 0 })
  usageCount: number;
}
