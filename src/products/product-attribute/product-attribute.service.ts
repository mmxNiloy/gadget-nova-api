import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { AttributeSearchDto, CreateProductAttributeDto } from '../dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from '../dto/update-product-attribute.dto';
import { ProductAttributeEntity } from '../entities/product-attribute.entity';
import { ProductEntity } from '../entities/product.entity';
import { AttributeValueEntity } from 'src/attribute/attribute-group/entities/attribute-value.entity';
import { AttributeValueService } from 'src/attribute/attribute-value/attribute-value.service';

@Injectable()
export class ProductAttributeService {
  constructor(
    @InjectRepository(ProductAttributeEntity)
    private readonly productAttributeRepository: Repository<ProductAttributeEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    // @InjectRepository(AttributeValueEntity)
    // private readonly attributeValueRepository: Repository<AttributeValueEntity>,
    private readonly attributeValueService: AttributeValueService,
  ) {}

  async create(
    dto: CreateProductAttributeDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductAttributeEntity> {
    const product = await this.productRepository.findOne({
      where: { id: dto.product_id },
    });
    if (!product) throw new NotFoundException('Product not found');

    const attributeValue = await this.attributeValueService.findOne(
      dto.attributeValue_id,
    );
    if (!attributeValue)
      throw new NotFoundException('Attribute value not found');

    const productAttribute = this.productAttributeRepository.create({
      ...dto,
      product,
      attributeValue,
      created_by: jwtPayload.id,
      created_user_name: jwtPayload.userName,
      created_at: new Date(),
    });

    return await this.productAttributeRepository.save(productAttribute);
  }

  async findAll(): Promise<ProductAttributeEntity[]> {
    return await this.productAttributeRepository.find({
      relations: ['product', 'attributeValue'],
    });
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    productSearchDto: AttributeSearchDto,
  ){
    
    try {
      const query = this.productAttributeRepository
        .createQueryBuilder('attribute')
        .leftJoinAndSelect('attribute.product', 'products')
        .leftJoinAndSelect('attribute.attributeValue', 'attributeValues')
        .where('attribute.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })

      if (productSearchDto.product_ids) {
        productSearchDto.product_ids = Array.isArray(productSearchDto.product_ids)
          ? productSearchDto.product_ids
          : [productSearchDto.product_ids];

        query.andWhere('products.id IN (:...product_ids)', {
          product_ids: productSearchDto.product_ids,
        });
      }

      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['product', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';

      query
        .orderBy(`attribute.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);

      const [products, total] = await query.getManyAndCount();

      return [products, total];
    } catch (error) {
      console.log(error);

      throw new BadRequestException({
        message: 'Error fetching products',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<ProductAttributeEntity> {
    const productAttribute = await this.productAttributeRepository.findOne({
      where: { id },
      relations: ['product', 'attributeValue'],
    });

    if (!productAttribute)
      throw new NotFoundException('Product attribute not found');

    return productAttribute;
  }

  async update(
    id: string,
    dto: UpdateProductAttributeDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductAttributeEntity> {
    const productAttribute = await this.findOne(id);
    if (!productAttribute)
      throw new NotFoundException('Product attribute not found');

    Object.assign(productAttribute, {
      ...dto,
      updated_by: jwtPayload.id,
      updated_user_name: jwtPayload.userName,
      updated_at: new Date(),
    });

    return await this.productAttributeRepository.save(productAttribute);
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductAttributeEntity> {
    const productAttribute = await this.findOne(id);
    productAttribute.is_active = ActiveStatusEnum.INACTIVE;
    productAttribute.updated_by = jwtPayload.id;
    productAttribute.updated_at = new Date();

    return await this.productAttributeRepository.save(productAttribute);
  }

  async removeByProductId(productId: string): Promise<void> {
    await this.productAttributeRepository.delete({
      product: { id: productId },
    });
  }
}
