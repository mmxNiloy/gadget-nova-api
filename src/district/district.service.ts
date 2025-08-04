import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistrictEntity } from '../common/entities/district.entity';
import districtsData from '../common/data/bangladesh-districts.json';
import { PaginationDTO } from '../common/dtos/pagination/pagination.dto';

@Injectable()
export class DistrictService implements OnModuleInit {
  constructor(
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
  ) {}

  async onModuleInit() {
    await this.seedDistricts();
  }

  private async seedDistricts() {
    const existingDistricts = await this.districtRepository.count();
    if (existingDistricts === 0) {
      const districts = districtsData.map((district: any) => ({
        name: district.name,
        delivery_charge: district.delivery_charge,
      }));
      await this.districtRepository.save(districts);
    }
  }

  async findAll(pagination: PaginationDTO, name?: string) {
    const queryBuilder = this.districtRepository.createQueryBuilder('district');

    if (name) {
      queryBuilder.where('district.name ILIKE :name', { name: `%${name}%` });
    }

    queryBuilder
      .orderBy(`district.${pagination.order}`, pagination.sort as 'ASC' | 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    const [districts, total] = await queryBuilder.getManyAndCount();

    return {
      districts,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findOne(id: string) {
    return await this.districtRepository.findOne({ where: { id } });
  }

  async findByName(name: string) {
    return await this.districtRepository.findOne({ where: { name } });
  }

  async updateDeliveryCharge(id: string, deliveryCharge: number) {
    const district = await this.districtRepository.findOne({ where: { id } });
    if (!district) {
      throw new Error('District not found');
    }
    district.delivery_charge = deliveryCharge;
    return await this.districtRepository.save(district);
  }
} 