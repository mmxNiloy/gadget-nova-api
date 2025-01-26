import { IsNotEmpty } from 'class-validator';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { CategoryEntity } from 'src/category/entities/category.entity';

@Entity('brands')
export class BrandEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: '50' })
  @IsNotEmpty()
  name: string;

  @ManyToMany(() => CategoryEntity, (category) => category.brands)
  @JoinTable({
    name: 'category_brands', 
    joinColumn: {
      name: 'brand_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: CategoryEntity[];
}
