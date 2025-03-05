import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';
import { Repository } from 'typeorm';
import { CreateAttributeGroupDto } from '../dto/create-attribute-group.dto';
import { UpdateAttributeGroupDto } from '../dto/update-attribute-group.dto';
import { AttributeGroupEntity } from '../entities/attribute-group.entity';

@Injectable()
export class AttributeGroupService {
  constructor(
    @InjectRepository(AttributeGroupEntity)
    private readonly attributeGroupRepository: Repository<AttributeGroupEntity>,
  ) {}

  async create(
    createAttributeGroupDto: CreateAttributeGroupDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<AttributeGroupEntity> {
    try {
      const attributeGroupEntity = {
        ...createAttributeGroupDto,
        created_at: new Date(),
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
      };

      const attributeGroup =
        await this.attributeGroupRepository.save(attributeGroupEntity);

      return attributeGroup;
    } catch (error) {
      throw new BadRequestException(error.response?.message);
    }
  }

  async findAll(): Promise<AttributeGroupEntity[]> {
    try {
      const attributeGroups = await this.attributeGroupRepository.find({
        where: { is_active: ActiveStatusEnum.ACTIVE },
      });
      return attributeGroups;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async findOne(id: string): Promise<AttributeGroupEntity> {
    try {
      const attributeGroup = await this.attributeGroupRepository.findOne({
        where: { id: id, is_active: ActiveStatusEnum.ACTIVE },
      });

      if (!attributeGroup) {
        throw new NotFoundException('attributeGroup Not found');
      }

      return attributeGroup;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async findMany(ids: string[]): Promise<AttributeGroupEntity[]> {
    try {
      const attributeGroups = await this.attributeGroupRepository
        .createQueryBuilder('attributeGroup')
        .where('attributeGroup.is_active = :status', {
          status: ActiveStatusEnum.ACTIVE,
        })
        .whereInIds(ids)
        .getMany();

      if (!attributeGroups.length) {
        throw new NotFoundException('attributeGroup Not found');
      }

      return attributeGroups;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async update(
    id: string,
    updateAttributeGroupDto: UpdateAttributeGroupDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<AttributeGroupEntity> {
    try {
      const attributeGroup = await this.findOne(id);

      const updatedAttributeGroup = {
        ...attributeGroup,
        ...updateAttributeGroupDto,
        updated_at: new Date(),
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
      };

      const updated = await this.attributeGroupRepository.save(
        updatedAttributeGroup,
      );

      return updated;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<AttributeGroupEntity> {
    try {
      const attributeGroup = await this.findOne(id);

      const updatedWorkspace = {
        ...attributeGroup,
        is_active: ActiveStatusEnum.INACTIVE,
        updated_by: jwtPayload.id,
        updated_at: new Date(),
        updated_user_name: jwtPayload.userName,
      };

      const deleted: AttributeGroupEntity =
        await this.attributeGroupRepository.save(updatedWorkspace);

      return deleted;
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
