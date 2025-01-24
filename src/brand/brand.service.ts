import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { CategoryService } from 'src/category/category.service';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
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

  async findAll(): Promise<BrandEntity[]> {
    try {
      return await this.brandRepository.find({ relations: ['categories'] });
    } catch (error) {
      throw new BadRequestException(error.message);
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
