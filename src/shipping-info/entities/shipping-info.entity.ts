import { IsNotEmpty } from "class-validator";
import { CustomBaseEntity } from "src/common/common-entities/custom-base.enity";
import { UserEntity } from "src/user/entities/user.entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('shipping-infos')
export class ShippingInfoEntity extends CustomBaseEntity {
  @Column({ name: "first_name", type: 'varchar', length: '50' })
  @IsNotEmpty()
  first_name: string;

  @Column({ name: "last_name",type: 'varchar', length: '50' })
  @IsNotEmpty()
  last_name: string;

  @Column({ name: "company_name",type: 'varchar', length: '50', nullable:true })
  company_name: string;

  @Column({ name: "email",type: 'varchar', length: '50' })
  @IsNotEmpty()
  email: string;

  @Column({ name: "phone",type: 'varchar', length: '50' })
  @IsNotEmpty()
  phone: string;

  @Column({ name: "address",type: 'text' })
  @IsNotEmpty()
  address: string;

  @Column({ name: "additional_info",type: 'text'})
  additional_info: string;

  @ManyToOne(() => UserEntity, (user) => user.shippingInfos, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
