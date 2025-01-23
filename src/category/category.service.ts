import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';

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

      console.log({jwtPayload});
      
      
      console.log({createCategoryDto});
      const categoryEntity = {
        ...createCategoryDto,
        created_at: new Date(),
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName
      };

      const category = await this.categoryRepository.save(categoryEntity);

      return category;
    } catch (error) {
      throw new BadRequestException(error.response?.message);
    }
  }

  async findAll(): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async findOne(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: id, is_active:ActiveStatusEnum.ACTIVE },
      });

      if(!category){
        throw new NotFoundException("Category Not found")
      }

      return category;
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
        updated_user_name: jwtPayload.userName
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
        updated_user_name: jwtPayload.userName
      };

      const deleted: CategoryEntity =
        await this.categoryRepository.save(updatedWorkspace);

      return deleted;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
