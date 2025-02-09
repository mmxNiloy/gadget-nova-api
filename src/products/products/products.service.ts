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
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    jwtPayload: JwtPayloadInterface,
    thumbnail?: Express.Multer.File,
    gallery?: Express.Multer.File[],
  ): Promise<ProductEntity> {
    try {
      const category = await this.categoryService.findOne(
        createProductDto.category_id,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const brand = await this.brandService.findOne(createProductDto.brand_id);
      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      delete createProductDto.category_id;
      delete createProductDto.brand_id;

      const productEntity = this.productRepository.create({
        ...createProductDto,
        category: category,
        brand: brand,
        thumbnail: createProductDto.thumbnail ? createProductDto.thumbnail.path : null,
        gallery: createProductDto.gallery ? createProductDto.gallery.map((file) => file.path) : [],
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      productEntity.stockAmount = createProductDto.quantity;
      productEntity.thresholdAMount = createProductDto.thresholdAMount;

      if (thumbnail) {
        productEntity.thumbnail = thumbnail.filename;
      }

      if (gallery) {
        productEntity.gallery = gallery.map((file) => file.filename);
      }

      return await this.productRepository.save(productEntity);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<ProductEntity[]> {
    try {
      return await this.productRepository.find({
        relations: [
          'category',
          'brand',
          'questions',
          'questions.answer',
          'ratings',
        ],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id, is_active: ActiveStatusEnum.ACTIVE },
      relations: [
        'category',
        'brand',
        'questions',
        'questions.answer',
        'ratings',
      ],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    jwtPayload: JwtPayloadInterface,
    thumbnail?: Express.Multer.File,
    gallery?: Express.Multer.File[],
  ): Promise<ProductEntity> {
    try {
      const product = await this.findOne(id);

      if (updateProductDto.category_id) {
        const category = await this.categoryService.findOne(
          updateProductDto.category_id,
        );
        if (!category) {
          throw new NotFoundException('Category not found');
        }
        product.category = category;
      }

      if (updateProductDto.brand_id) {
        const brand = await this.brandService.findOne(
          updateProductDto.brand_id,
        );
        if (!brand) {
          throw new NotFoundException('Brand not found');
        }
        product.brand = brand;
      }

      Object.assign(product, {
        ...updateProductDto,
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
        updated_at: new Date(),
      });

      if (thumbnail) {
        product.thumbnail = thumbnail.filename;
      }

      if (gallery) {
        product.gallery = gallery.map((file) => file.filename);
      }

      return await this.productRepository.save(product);
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
