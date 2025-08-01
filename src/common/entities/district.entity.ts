import { CustomBaseEntity } from '../common-entities/custom-base.enity';
import { Column, Entity, Index } from 'typeorm';

@Entity('districts')
export class DistrictEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 120 })
  delivery_charge: number;
} 