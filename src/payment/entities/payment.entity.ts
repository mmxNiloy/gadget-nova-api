import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { PaymentMethodEnum } from 'src/common/enums/payment-method.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
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

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentId: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  executeResponse: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payerReference: string;

  @Column({ type: 'timestamp', nullable: true })
  paymentTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  orderAmount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transactionStatus: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  merchantInvoiceNumber: string;
  
}
