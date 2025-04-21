import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import {
  CategorySearchDto,
  CreateCategoryDto,
} from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { Bool } from 'src/common/enums/bool.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<CategoryEntity> {
    try {
      let parentCategory = null;

      if (createCategoryDto.parent_category_id) {
        parentCategory = await this.categoryRepository.findOne({
          where: {
            id: createCategoryDto.parent_category_id,
            is_active: ActiveStatusEnum.ACTIVE,
          },
        });

        if (!parentCategory) {
          throw new NotFoundException('Parent category not found');
        }
      }

      const categoryEntity = this.categoryRepository.create({
        ...createCategoryDto,
        parentCategory,
        created_at: new Date(),
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
      });

      return await this.categoryRepository.save(categoryEntity);
    } catch (error) {
      console.log(error);

      throw new BadRequestException(error.response?.message);
    }
  }

  async findAll(name?: string): Promise<CategoryEntity[]> {
    try {
      const query = this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.subCategories', 'subCategory')
        .where('category.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .andWhere('category.parentCategory IS NULL');

      if (name) {
        query.andWhere('LOWER(category.name) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async findAllSubcategories(name?: string): Promise<CategoryEntity[]> {
    try {
      const query = this.categoryRepository
        .createQueryBuilder('subcategory')
        .leftJoinAndSelect('subcategory.parentCategory', 'parentCategory')
        .where('subcategory.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .andWhere('subcategory.parentCategory IS NOT NULL');

      if (name) {
        query.andWhere('LOWER(subcategory.name) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async findSubcategoriesByCategory(
    categoryId: string,
  ): Promise<CategoryEntity[]> {
    try {
      const subcategories = await this.categoryRepository
        .createQueryBuilder('subcategory')
        .leftJoinAndSelect('subcategory.parentCategory', 'parentCategory')
        .where('subcategory.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .andWhere('subcategory.parentCategory.id = :categoryId', { categoryId })
        .getMany();

      if (!subcategories.length) {
        throw new NotFoundException(
          'No subcategories found for the given category ID',
        );
      }

      return subcategories;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.message || 'Failed to retrieve subcategories',
      );
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: 'DESC' | 'ASC',
    order: string,
    categorySearchDto: CategorySearchDto,
  ) {
    try {
      const query = this.categoryRepository
        .createQueryBuilder('categories')
        .where('categories.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .leftJoinAndSelect('categories.subCategories', 'subCategories')
        .andWhere('categories.parentCategory IS NULL');

      if (categorySearchDto.name) {
        query.andWhere('LOWER(categories.name) LIKE :name', {
          name: `%${categorySearchDto.name.toLowerCase()}%`,
        });
      }

      if (categorySearchDto.isFeatured !== undefined) {
        console.log('Feature', categorySearchDto.isFeatured);
        query.andWhere('categories.isFeatured = :isFeatured', {
          isFeatured: categorySearchDto.isFeatured === Bool.YES ? 1 : 0,
        });
      }

      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['name', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';

      query
        .orderBy(`categories.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);

      const [categories, total] = await query.getManyAndCount();

      return [categories, total];
    } catch (error) {
      console.log(error);
      
      throw new BadRequestException({
        message: 'Error fetching categories',
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.subCategories', 'subCategory')
        .leftJoinAndSelect('category.parentCategory', 'parentCategory')
        .leftJoinAndSelect('category.brands', 'brands')
        .where('category.id = :id', { id })
        .andWhere('category.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .getOne();

      if (!category) {
        throw new NotFoundException('Category Not found');
      }

      return category;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.message || 'Failed to retrieve category',
      );
    }
  }

  async findMany(ids: string[]): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .whereInIds(ids)
        .getMany();

      if (!categories.length) {
        throw new NotFoundException('Category Not found');
      }

      return categories;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<CategoryEntity> {
    try {
      const category = await this.findOne(id);
      let parentCategory = category.parentCategory;

      if (updateCategoryDto.parent_category_id) {
        parentCategory = await this.findOne(
          updateCategoryDto.parent_category_id,
        );
      }

      const updatedCategory = {
        ...category,
        ...updateCategoryDto,
        parentCategory,
        updated_at: new Date(),
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
      };

      return await this.categoryRepository.save(updatedCategory);
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<CategoryEntity> {
    try {
      const category = await this.findOne(id);

      const updatedWorkspace = {
        ...category,
        is_active: ActiveStatusEnum.INACTIVE,
        updated_by: jwtPayload.id,
        updated_at: new Date(),
        updated_user_name: jwtPayload.userName,
      };

      const deleted: CategoryEntity =
        await this.categoryRepository.save(updatedWorkspace);

      return deleted;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
