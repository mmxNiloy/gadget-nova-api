import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { CategorySearchDto, CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

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
      console.log({ jwtPayload });

      console.log({ createCategoryDto });
      const categoryEntity = {
        ...createCategoryDto,
        created_at: new Date(),
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
      };

      const category = await this.categoryRepository.save(categoryEntity);

      return category;
    } catch (error) {
      throw new BadRequestException(error.response?.message);
    }
  }

  async findAll(name?: string): Promise<CategoryEntity[]> {
    try {
      const query = this.categoryRepository.createQueryBuilder('categories')
        .where('categories.is_active = :status', { status: ActiveStatusEnum.ACTIVE });
  
      if (name) {
        query.andWhere('LOWER(categories.name) LIKE :name', {
          name: `%${name.toLowerCase()}%`,
        });
      }
  
      const categories = await query.getMany();
      return categories;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
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
      const query = this.categoryRepository.createQueryBuilder('categories')
        .where('categories.is_active = :status', { status: ActiveStatusEnum.ACTIVE });
  
      // Filter by name if provided
      if (categorySearchDto.name) {
        query.andWhere('LOWER(categories.name) LIKE :name', {
          name: `%${categorySearchDto.name.toLowerCase()}%`,
        });
      }
  
      // Ensure valid sort and order fields
      sort = ['ASC', 'DESC'].includes(sort) ? sort : 'DESC';
      const orderFields = ['name', 'created_at', 'updated_at'];
      order = orderFields.includes(order) ? order : 'updated_at';
  
      // Apply sorting, pagination
      query.orderBy(`categories.${order}`, sort)
        .skip((page - 1) * limit)
        .take(limit);
  
      const [categories, total] = await query.getManyAndCount();
      
      return [categories, total];
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching categories',
        details: error.message,
      });
    }
  }
  

  async findOne(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: id, is_active: ActiveStatusEnum.ACTIVE },
      });

      if (!category) {
        throw new NotFoundException('Category Not found');
      }

      return category;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async findMany(ids: string[]): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.is_active = :status',{
          status:ActiveStatusEnum.ACTIVE
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

      const updatedCategory = {
        ...category,
        ...updateCategoryDto,
        updated_at: new Date(),
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
      };

      const updated = await this.categoryRepository.save(updatedCategory);

      return updated;
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
