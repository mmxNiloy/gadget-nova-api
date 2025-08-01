import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { DistrictEntity } from 'src/common/entities/district.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('shipping_infos')
export class ShippingInfoEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 50 })
  first_name: string;

  @Column({ type: 'varchar', length: 50 })
  last_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  company_name: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  additional_info: string;

  @ManyToOne(() => UserEntity, (user) => user.shippingInfos)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => DistrictEntity)
  @JoinColumn({ name: 'district_id' })
  district: DistrictEntity;
}
