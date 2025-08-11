import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistrictEntity } from '../common/entities/district.entity';
import districtsData from '../common/data/bangladesh-districts.json';

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

  async findAll(name?: string) {
    if (name) {
      // Search districts by name using simple ORM
      const districts = await this.districtRepository
        .createQueryBuilder('district')
        .where('district.name ILIKE :name', { name: `%${name}%` })
        .orderBy('district.name', 'ASC')
        .getMany();
      
      return {
        districts,
        total: districts.length
      };
    } else {
      // Get all districts using simple ORM
      const districts = await this.districtRepository.find({
        order: { name: 'ASC' }
      });
      
      return {
        districts,
        total: districts.length
      };
    }
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