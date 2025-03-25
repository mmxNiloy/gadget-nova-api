import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { CategoryService } from 'src/category/category.service';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { BrandSearchDto, CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandEntity } from './entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
    private readonly categoryService:CategoryService
  ) {}

  async create(
    createBrandDto: CreateBrandDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<BrandEntity> {
    try {
      const categories = await this.categoryService.findMany(
        createBrandDto.category_ids,
      );

      console.log({categories});
      

      if (!categories.length) {
        throw new NotFoundException('Categories not found');
      }

      const brandEntity = this.brandRepository.create({
        ...createBrandDto,
        categories:categories,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      return await this.brandRepository.save(brandEntity);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  async findAll(name?: string): Promise<BrandEntity[]> {
    try {
      const query = this.brandRepository.createQueryBuilder('brand')
        .where('brand.is_active = :status', { status: ActiveStatusEnum.ACTIVE })
        .leftJoinAndSelect('brand.categories','categories')
  
      if (name) {
        query.andWhere('LOWER(brand.name) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        });
      }
  
      const brnads = await query.getMany();
      return brnads;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    brandSearchDto: BrandSearchDto,
  ) {
    try {
      const query = this.brandRepository.createQueryBuilder('brands')
        .where('brands.is_active = :status', { status: ActiveStatusEnum.ACTIVE })
        .leftJoinAndSelect('brands.categories', 'category')
  
      if (brandSearchDto.name) {
        query.andWhere('LOWER(brands.name) LIKE :name', {
          name: `%${brandSearchDto.name.toLowerCase()}%`,
        });
      }

      console.log(brandSearchDto.category_ids);
      

      if (brandSearchDto.category_ids) {
        brandSearchDto.category_ids = Array.isArray(brandSearchDto.category_ids)
          ? brandSearchDto.category_ids
          : [brandSearchDto.category_ids];
      
        query.andWhere('category.id IN (:...category_ids)', { category_ids: brandSearchDto.category_ids });
      }
      
  
      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['name', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';
  
      query.orderBy(`brands.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);
  
      const [brands, total] = await query.getManyAndCount();
      
      return [brands, total];
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching brands',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<BrandEntity> {
    const brand = await this.brandRepository.findOne({
      where: { id, is_active: ActiveStatusEnum.ACTIVE },
      relations: ['categories'],
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<BrandEntity> {
    try {
      const brand = await this.findOne(id);

      if (updateBrandDto.category_ids) {
        const categories = await this.categoryService.findMany(
          updateBrandDto.category_ids,
        );

        if (!categories.length) {
          throw new NotFoundException('Categories not found');
        }

        brand.categories = categories;
      }

      Object.assign(brand, {
        ...updateBrandDto,
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
        updated_at: new Date(),
      });

      return await this.brandRepository.save(brand);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<BrandEntity> {
    const brand = await this.findOne(id);

    brand.is_active = ActiveStatusEnum.INACTIVE;
    brand.updated_by = jwtPayload.id;
    brand.updated_user_name = jwtPayload.userName;
    brand.updated_at = new Date();

    return await this.brandRepository.save(brand);
  }
}
