import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { CustomBaseEntity } from 'src/common/common-entities/custom-base.enity';
import { ProductEntity } from './product.entity';
import { AttributeValueEntity } from 'src/attribute/attribute-group/entities/attribute-value.entity';

@Entity('product_attributes')
export class ProductAttributeEntity extends CustomBaseEntity {
  @ManyToOne(() => ProductEntity, (product) => product.productAttributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(
    () => AttributeValueEntity,
    (attributeValue) => attributeValue.productAttributes,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue: AttributeValueEntity;
}
