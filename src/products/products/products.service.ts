import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Bool } from 'src/common/enums/bool.enum';
import { PromoDiscountUtil } from 'src/common/utils/promo-amount.util';
import { S3Service } from 'src/s3/s3.service';
import { In, Repository } from 'typeorm';
import {
  CreateProductDto,
  ProductsByIDListQueryDTO,
  ProductSearchDto,
} from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductAttributeService } from '../product-attribute/product-attribute.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
    private readonly productAttributeService: ProductAttributeService,
    private readonly s3Service: S3Service,
    private readonly promoDiscountUtil: PromoDiscountUtil,
  ) {}

  private calculateAverageRating(product: ProductEntity): number {
    if (!product.ratings || product.ratings.length === 0) {
      return 0;
    }
    const sum = product.ratings.reduce(
      (acc, rating) => acc + rating.star_count,
      0,
    );
    return Number((sum / product.ratings.length).toFixed(1));
  }

  private addAverageRatingToProduct(product: ProductEntity) {
    const averageRating = this.calculateAverageRating(product);
    return {
      ...product,
      average_rating: averageRating,
      total_ratings: product.ratings ? product.ratings.length : 0,
    };
  }

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

  async findAll(title?: string, page = 1, limit = 10) {
    try {
      const query = this.productRepository
        .createQueryBuilder('product')
        .where('product.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.questions', 'questions')
        .leftJoinAndSelect('questions.answer', 'answer')
        .leftJoinAndSelect('product.ratings', 'ratings')
        .leftJoinAndSelect('product.productAttributes', 'productAttributes')
        .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
        .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup')
        .leftJoinAndSelect(
          'product.promotionalDiscounts',
          'promotionalDiscounts',
        );

      const raw = title?.trim() ?? '';
      if (raw) {
        const searchQuery = this.productRepository
          .createQueryBuilder('product')
          .addSelect('product.id')
          .addSelect('product.title')
          .addSelect(
            `ts_rank_cd(to_tsvector('english', unaccent(product.title)),to_tsquery('english',replace(trim(${raw}), ' ', ':* & ') || ':*')) + GREATEST(similarity(unaccent(product.title), unaccent(${raw})),word_similarity(unaccent(product.title), unaccent(${raw}))) AS relevance`,
          )
          .where(
            `to_tsvector('english', unaccent(product.title)) @@ to_tsquery('english', replace(trim(:search_term), ' ', ':* & ') || ':*')`,
            {
              search_term: raw,
            },
          )
          .orWhere(`unaccent(product.title) % unaccent(:search_term)`, {
            search_term: raw,
          });

        const searchedIds = await searchQuery.getMany();
        console.log('Searched Products', searchedIds);
        query.innerJoin(
          () => searchQuery,
          'searched',
          'searched.id = product.id',
        );
        query.orderBy('searched.relevance', 'DESC');
      } else {
        query.orderBy('product.updated_at', 'DESC');
      }

      // Pagination
      query.skip((page - 1) * limit).take(limit);

      const products = await query.getMany();

      // Apply promo discount + average rating
      const updatedProducts = products.map((product) => ({
        ...this.addAverageRatingToProduct(product),
        ...this.promoDiscountUtil.filterActivePromo(product),
      }));

      return updatedProducts;
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
    try {
      const query = this.productRepository
        .createQueryBuilder('product')
        .where('product.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.questions', 'questions')
        .leftJoinAndSelect('questions.answer', 'answer')
        .leftJoinAndSelect('product.ratings', 'ratings')
        .leftJoinAndSelect('product.productAttributes', 'productAttributes')
        .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
        .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup')
        .leftJoinAndSelect(
          'product.promotionalDiscounts',
          'promotionalDiscounts',
        );

      const { title } = productSearchDto;

      // Filter by Elasticsearch IDs
      const raw = title?.trim() ?? '';
      if (raw) {
        query
          .setParameters({ search_term: raw })
          // .addSelect('unaccent(lower(product.title))', 'title_norm')
          // .addSelect('unaccent(lower(:search_term))', 'q_norm')
          .addSelect(
            `(ts_rank_cd(to_tsvector('english', unaccent(lower(product.title))),to_tsquery('english', replace(trim(unaccent(lower(:search_term))), ' ', ':* & ') || ':*')) * 2.0) + (GREATEST(similarity(unaccent(lower(product.title)), unaccent(lower(:search_term))), word_similarity(unaccent(lower(product.title)), unaccent(lower(:search_term)))) * 0.6) + CASE WHEN unaccent(lower(product.title)) LIKE '%' || unaccent(lower(:search_term)) || '%' THEN 0.8 ELSE 0 END`,
            'relevance',
          )
          .addSelect(
            `(to_tsvector('english', unaccent(lower(product.title))) @@ to_tsquery('english', replace(trim(unaccent(lower(:search_term))), ' ', ':* & ') || ':*'))`,
            'both_terms',
          )
          .andWhere(
            `(to_tsvector('english', unaccent(lower(product.title))) @@ to_tsquery('english', replace(trim(unaccent(lower(:search_term))), ' ', ':* & ') || ':*'))`,
          )
          .orWhere(
            `similarity(unaccent(lower(product.title)), unaccent(lower(:search_term))) >= 0.1`,
          )
          .addOrderBy('both_terms', 'DESC')
          .addOrderBy('relevance', 'DESC');
      }

      if (productSearchDto.productCode) {
        query.andWhere('LOWER(product.productCode) LIKE :productCode', {
          productCode: `%${productSearchDto.productCode.toLowerCase()}%`,
        });
      }

      // Filter out products based on parent category
      if (productSearchDto.category) {
        query.andWhere('category.slug = :category', {
          category: productSearchDto.category,
        });
      }

      // Filter out products based on subcategories
      if (productSearchDto.subcategories) {
        const subcategories = Array.isArray(productSearchDto.subcategories)
          ? productSearchDto.subcategories
          : [productSearchDto.subcategories];
        query.andWhere('subCategory.slug IN (:...subcategories)', {
          subcategories,
        });
      }

      // Brands filter
      if (productSearchDto.brands) {
        const brands = Array.isArray(productSearchDto.brands)
          ? productSearchDto.brands
          : [productSearchDto.brands];
        query.andWhere('brand.slug IN (:...brands)', { brands });
      }

      // Category IDs filter
      if (productSearchDto.category_ids) {
        const categoryIds = Array.isArray(productSearchDto.category_ids)
          ? productSearchDto.category_ids
          : [productSearchDto.category_ids];
        query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
      }

      // Brand IDs filter
      if (productSearchDto.brand_ids) {
        const brandIds = Array.isArray(productSearchDto.brand_ids)
          ? productSearchDto.brand_ids
          : [productSearchDto.brand_ids];
        query.andWhere('brand.id IN (:...brandIds)', { brandIds });
      }

      // Trending filter
      if (productSearchDto.isTrending !== undefined) {
        query.andWhere('product.isTrending = :isTrending', {
          isTrending: productSearchDto.isTrending === Bool.YES ? 1 : 0,
        });

        if (productSearchDto.isTrending === Bool.YES) {
          const currentDate = moment().toDate();
          query.andWhere('product.trendingStartDate <= :currentDate', {
            currentDate,
          });
          query.andWhere('product.trendingEndDate >= :currentDate', {
            currentDate,
          });
        }
      }

      // BestSeller filter
      if (productSearchDto.isBestSeller !== undefined) {
        query.andWhere('product.isBestSeller = :isBestSeller', {
          isBestSeller: productSearchDto.isBestSeller === Bool.YES ? 1 : 0,
        });
      }

      // Featured filter
      if (productSearchDto.isFeatured !== undefined) {
        query.andWhere('product.isFeatured = :isFeatured', {
          isFeatured: productSearchDto.isFeatured === Bool.YES ? 1 : 0,
        });

        if (productSearchDto.isFeatured === Bool.YES) {
          const currentDate = moment().toDate();
          query.andWhere('product.featuredStartDate <= :currentDate', {
            currentDate,
          });
          query.andWhere('product.featuredEndDate >= :currentDate', {
            currentDate,
          });
        }
      }

      // Stock filter
      if (productSearchDto.isInStock !== undefined) {
        query.andWhere('product.isInStock = :isInStock', {
          isInStock: productSearchDto.isInStock === Bool.YES ? 1 : 0,
        });
      }

      // Date filters
      if (productSearchDto.trendingStartDate) {
        query.andWhere('product.trendingStartDate >= :trendingStartDate', {
          trendingStartDate: productSearchDto.trendingStartDate,
        });
      }

      if (productSearchDto.trendingEndDate) {
        query.andWhere('product.trendingEndDate <= :trendingEndDate', {
          trendingEndDate: productSearchDto.trendingEndDate,
        });
      }

      if (productSearchDto.featuredStartDate) {
        query.andWhere('product.featuredStartDate >= :featuredStartDate', {
          featuredStartDate: productSearchDto.featuredStartDate,
        });
      }

      if (productSearchDto.featuredEndDate) {
        query.andWhere('product.featuredEndDate <= :featuredEndDate', {
          featuredEndDate: productSearchDto.featuredEndDate,
        });
      }

      // Price filters
      if (productSearchDto.minPrice !== undefined) {
        query.andWhere('product.regularPrice >= :minPrice', {
          minPrice: productSearchDto.minPrice,
        });
      }

      if (productSearchDto.maxPrice !== undefined) {
        query.andWhere('product.regularPrice <= :maxPrice', {
          maxPrice: productSearchDto.maxPrice,
        });
      }

      // Sorting
      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['name', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';
      query.addOrderBy(`product.${order}`, sort);

      // Pagination
      query.skip((page - 1) * limit).take(limit);

      const [products, total] = await query.getManyAndCount();

      // Apply rating & promo logic
      const updatedProducts = products.map((product) => ({
        ...this.addAverageRatingToProduct(product),
        ...this.promoDiscountUtil.filterActivePromo(product),
      }));

      return [updatedProducts, total];
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        message: 'Error fetching products',
        details: error.message,
      });
    }
  }

  // Get specific products
  // Used for cached carts
  // Intended For anonymous users
  async getProductsByIDList(query: ProductsByIDListQueryDTO) {
    try {
      const { ids } = query;

      const idSet = Array.from(new Set(ids));

      console.log(
        '[GET /products/id/list] > [Products Service] Product By ID Set >',
        idSet,
      );

      const products = this.productRepository
        .createQueryBuilder('product')
        .where('product.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .andWhere('product.id IN (:...product_ids)', { product_ids: idSet })
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.subCategory', 'subCategory')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('product.questions', 'questions')
        .leftJoinAndSelect('questions.answer', 'answer')
        .leftJoinAndSelect('product.ratings', 'ratings')
        .leftJoinAndSelect('product.productAttributes', 'productAttributes')
        .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
        .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup')
        .leftJoinAndSelect(
          'product.promotionalDiscounts',
          'promotionalDiscounts',
        )
        .getMany();

      return products;
    } catch (error) {
      console.log('Failed to fetch products', error);
      throw new BadRequestException({
        message: 'Error fetching products',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<ProductEntity> {
    // Check if the given is is a slug or an id
    const isUUID =
      /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/.test(
        id,
      );

    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.is_active = :status', {
        status: ActiveStatusEnum.ACTIVE,
      })
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.questions', 'questions')
      .leftJoinAndSelect('questions.answer', 'answer')
      .leftJoinAndSelect('product.ratings', 'ratings')
      .leftJoinAndSelect('product.promotionalDiscounts', 'promotionalDiscounts')
      .leftJoinAndSelect('product.productAttributes', 'productAttributes')
      .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
      .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup');

    if (isUUID) {
      query.where('product.id = :id', { id });
    } else {
      query.where('product.slug = :slug', { slug: id });
    }

    const product = await query.getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...this.addAverageRatingToProduct(product),
      ...this.promoDiscountUtil.filterActivePromo(product),
    };
  }

  async findBySlug(slug: string): Promise<ProductEntity> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.slug = :slug', { slug })
      .andWhere('product.is_active = :status', {
        status: ActiveStatusEnum.ACTIVE,
      })
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.questions', 'questions')
      .leftJoinAndSelect('questions.answer', 'answer')
      .leftJoinAndSelect('product.ratings', 'ratings')
      .leftJoinAndSelect('product.promotionalDiscounts', 'promotionalDiscounts')
      .leftJoinAndSelect('product.productAttributes', 'productAttributes')
      .leftJoinAndSelect('productAttributes.attributeValue', 'attributeValue')
      .leftJoinAndSelect('attributeValue.attributeGroup', 'attributeGroup');

    const product = await query.getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...this.addAverageRatingToProduct(product),
      ...this.promoDiscountUtil.filterActivePromo(product),
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<ProductEntity> {
    try {
      let product = await this.findOne(id);
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
        const uploaded = await this.s3Service.uploadFile(
          updateProductDto.thumbnail,
          'products/thumbnails',
        );

        product.thumbnail = uploaded.Location;
      }

      if (updateProductDto.gallery?.length) {
        const galleryUrls = await Promise.all(
          updateProductDto.gallery.map((file) =>
            this.s3Service
              .uploadFile(file, 'products/gallery')
              .then((res) => res.Location),
          ),
        );
        product.gallery = galleryUrls;
      }

      const {
        thumbnail,
        gallery,
        category_id,
        brand_id,
        attribute_value_ids,
        ...rest
      } = updateProductDto;

      Object.assign(product, {
        ...rest,
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
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete in DB
    product.is_active = ActiveStatusEnum.INACTIVE;
    product.updated_by = jwtPayload.id;
    product.updated_user_name = jwtPayload.userName;
    product.updated_at = new Date();

    const savedProduct = await this.productRepository.save(product);

    return savedProduct;
  }

  async findManyByIds(ids: string[]): Promise<ProductEntity[]> {
    if (!ids.length) {
      return [];
    }

    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.is_active = :status', {
        status: ActiveStatusEnum.ACTIVE,
      })
      .andWhere('product.id IN (:...ids)', { ids });

    const products = await query.getMany();

    return products;
  }

  async getWishlisersByProduct(productId: string) {
    // Fetch product with its wishlistedBy users
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['wishlistedBy'],
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  // async getWishlisersByProductSlug(slug: string) {
  //   // Fetch product with its wishlistedBy users by slug
  //   const product = await this.productRepository.findOne({
  //     where: { slug: slug },
  //     relations: ['wishlistedBy'],
  //   });

  //   if (!product) throw new NotFoundException('Product not found');

  //   return product;
  // }
}
