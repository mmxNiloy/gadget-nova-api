import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttributeValueEntity } from './attribute-value.entity';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';

@Entity('attribute_groups')
export class AttributeGroupEntity extends CustomBaseEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @OneToMany(
    () => AttributeValueEntity,
    (attributeValue) => attributeValue.attributeGroup,
  )
  values: AttributeValueEntity[];
}
