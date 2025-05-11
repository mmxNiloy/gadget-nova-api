import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { PaymentMethodEnum } from 'src/common/enums/payment-method.enum';
import { OrderEntity } from 'src/order/entities/order.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('payments')
export class PaymentEntity extends CustomBaseEntity {
  @ManyToOne(() => OrderEntity, (order) => order.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ type: 'enum', enum: PaymentMethodEnum })
  paymentMethod: PaymentMethodEnum;

  @Column({ type: 'text', nullable: true })
  providerResponse: string;
}
