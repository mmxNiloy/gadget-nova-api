import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BrandEntity } from 'src/brand/entities/brand.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MetaService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
  ) {}

  async countProducts(limit: number) {
    const totalProducts = await this.productRepository.count({
      where: { is_active: ActiveStatusEnum.ACTIVE },
    });

    return {
      total: totalProducts,
      pageCount: Math.ceil(totalProducts / limit),
    };
  }

  async getAllProductSlugs(): Promise<string[]> {
    const products = await this.productRepository.find({
      select: ['slug'],
      where: { is_active: ActiveStatusEnum.ACTIVE },
    });

    return products.map((product) => product.slug);
  }

  async getAllBaseCategorySlugs(): Promise<string[]> {
    const categories = await this.categoryRepository.find({
      select: ['slug'],
      where: { is_active: ActiveStatusEnum.ACTIVE, parentCategory: null },
    });

    return categories.map((category) => category.slug);
  }
}
