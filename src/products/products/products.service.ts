import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { S3Service } from 'src/s3/s3.service';
import { Repository } from 'typeorm';
import { CreateProductDto, ProductSearchDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductAttributeService } from '../product-attribute/product-attribute.service';
import { title } from 'process';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
    private readonly productAttributeService: ProductAttributeService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductEntity> {
    try {
      const category = await this.categoryService.findOne(
        createProductDto.category_id,
      );
      if (!category) throw new NotFoundException('Category not found');

      let subcategory = null;
      if (createProductDto.subcategory_id) {
        subcategory = await this.categoryService.findOne(
          createProductDto.subcategory_id,
        );
        if (!subcategory) throw new NotFoundException('Subcategory not found');

        if (subcategory.parentCategory?.id !== category.id) {
          throw new BadRequestException(
            'Subcategory does not belong to the selected category',
          );
        }
      }

      const brand = await this.brandService.findOne(createProductDto.brand_id);
      if (!brand) throw new NotFoundException('Brand not found');

      const thumbnailUrl = createProductDto.thumbnail
        ? (
            await this.s3Service.uploadFile(
              createProductDto.thumbnail,
              'products/thumbnails',
            )
          ).Location
        : null;

      const galleryUrls =
        createProductDto.gallery && createProductDto.gallery.length > 0
          ? await Promise.all(
              createProductDto.gallery.map(async (file) => {
                const uploadResult = await this.s3Service.uploadFile(
                  file,
                  'products/gallery',
                );
                return uploadResult.Location;
              }),
            )
          : [];

      const productEntity = this.productRepository.create({
        ...createProductDto,
        category: category,
        subCategory: subcategory,
        brand: brand,
        thumbnail: thumbnailUrl,
        gallery: galleryUrls,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      productEntity.stockAmount = createProductDto.quantity;
      productEntity.thresholdAMount = createProductDto.thresholdAMount;
      const savedProduct = await this.productRepository.save(productEntity);

      let attributeValueIds = createProductDto.attribute_value_ids;

      if (!Array.isArray(attributeValueIds)) {
        attributeValueIds = [attributeValueIds];
      }

      if (attributeValueIds.length) {
        await Promise.all(
          attributeValueIds.map((attributeValueId) =>
            this.productAttributeService.create(
              {
                product_id: savedProduct.id,
                attributeValue_id: attributeValueId,
              },
              jwtPayload,
            ),
          ),
        );
      }

      return savedProduct;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(title?: string): Promise<ProductEntity[]> {
    try {
      const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.questions', 'questions')
        .leftJoinAndSelect('questions.answer', 'answer')
        .leftJoinAndSelect('product.ratings', 'ratings')
        .leftJoinAndSelect('product.productAttributes', 'productAttributes')
        .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
        .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup');

      if (title) {
        query.andWhere('LOWER(product.title) LIKE :title', {
          title: `%${title.toLowerCase()}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    productSearchDto: ProductSearchDto,
  ) {
    console.log(productSearchDto.title);

    try {
      const query = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.questions', 'questions')
        .leftJoinAndSelect('questions.answer', 'answer')
        .leftJoinAndSelect('product.ratings', 'ratings')
        .leftJoinAndSelect('product.productAttributes', 'productAttributes')
        .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
        .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup');

      if (productSearchDto.title) {
        query.andWhere('LOWER(product.title) LIKE :title', {
          title: `%${productSearchDto.title.toLowerCase()}%`,
        });
      }

      if (productSearchDto.productCode) {
        query.andWhere('LOWER(product.productCode) LIKE :productCode', {
          productCode: `%${productSearchDto.productCode.toLowerCase()}%`,
        });
      }

      if (productSearchDto.category_ids) {
        productSearchDto.category_ids = Array.isArray(
          productSearchDto.category_ids,
        )
          ? productSearchDto.category_ids
          : [productSearchDto.category_ids];

        query.andWhere('category.id IN (:...category_ids)', {
          category_ids: productSearchDto.category_ids,
        });
      }

      if (productSearchDto.brand_ids) {
        productSearchDto.brand_ids = Array.isArray(productSearchDto.brand_ids)
          ? productSearchDto.brand_ids
          : [productSearchDto.brand_ids];

        query.andWhere('brand.id IN (:...brand_ids)', {
          brand_ids: productSearchDto.brand_ids,
        });
      }

      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['name', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';

      query
        .orderBy(`product.${order}`, sort)
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

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.questions', 'questions')
      .leftJoinAndSelect('questions.answer', 'answer')
      .leftJoinAndSelect('product.ratings', 'ratings')
      .where('product.id = :id', { id })
      .andWhere('product.is_active = :status', {
        status: ActiveStatusEnum.ACTIVE,
      })
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductEntity> {
    try {
      const product = await this.findOne(id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (updateProductDto.category_id) {
        const category = await this.categoryService.findOne(
          updateProductDto.category_id,
        );
        if (!category) throw new NotFoundException('Category not found');
        product.category = category;
      }

      if (updateProductDto.brand_id) {
        const brand = await this.brandService.findOne(
          updateProductDto.brand_id,
        );
        if (!brand) throw new NotFoundException('Brand not found');
        product.brand = brand;
      }

      if (updateProductDto.thumbnail) {
        const { Location } = await this.s3Service.uploadFile(
          updateProductDto.thumbnail,
          'products/thumbnails',
        );
        product.thumbnail = Location;
      }

      if (updateProductDto.gallery?.length) {
        const galleryUrls = await Promise.all(
          updateProductDto.gallery.map(async (file) => {
            const { Location } = await this.s3Service.uploadFile(
              file,
              'products/gallery',
            );
            return Location;
          }),
        );
        product.gallery = galleryUrls;
      }

      Object.assign(product, {
        ...updateProductDto,
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
        updated_at: new Date(),
      });

      const updatedProduct = await this.productRepository.save(product);

      if (updateProductDto.attribute_value_ids) {
        await this.productAttributeService.removeByProductId(updatedProduct.id);

        await Promise.all(
          updateProductDto.attribute_value_ids.map((attributeValueId) =>
            this.productAttributeService.create(
              {
                product_id: updatedProduct.id,
                attributeValue_id: attributeValueId,
              },
              jwtPayload,
            ),
          ),
        );
      }

      return updatedProduct;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    product.is_active = ActiveStatusEnum.INACTIVE;
    product.updated_by = jwtPayload.id;
    product.updated_user_name = jwtPayload.userName;
    product.updated_at = new Date();

    return await this.productRepository.save(product);
  }
}
