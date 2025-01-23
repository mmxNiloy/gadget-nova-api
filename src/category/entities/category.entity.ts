import { IsNotEmpty } from 'class-validator';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Column, Entity } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: '50' })
  @IsNotEmpty()
  name: string;
}
