import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { ProductAttributeEntity } from 'src/products/entities/product-attribute.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AttributeGroupEntity } from './attribute-group.entity';

@Entity('attribute_values')
export class AttributeValueEntity extends CustomBaseEntity {
  @Column({ name: 'value', type: 'varchar', length: 255 })
  value: string;

  @ManyToOne(
    () => AttributeGroupEntity,
    (attributeGroup) => attributeGroup.values,
    {
      onDelete: 'CASCADE',
      eager: true,
    },
  )
  @JoinColumn({ name: 'attributeGroup_id' })
  attributeGroup: AttributeGroupEntity;

  @OneToMany(
    () => ProductAttributeEntity,
    (productAttribute) => productAttribute.attributeValue,
  )
  productAttributes: ProductAttributeEntity[];
}
