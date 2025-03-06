import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttributeValueDto } from '../attribute-group/dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from '../attribute-group/dto/update-attribute-value.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributeValueEntity } from '../attribute-group/entities/attribute-value.entity';
import { Repository } from 'typeorm';
import { AttributeGroupService } from '../attribute-group/attribute-group/attribute-group.service';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { ActiveStatusEnum } from 'src/common/enums/active-status.enum';

@Injectable()
export class AttributeValueService {
  constructor(
    @InjectRepository(AttributeValueEntity)
    private readonly attributeValueRepository: Repository<AttributeValueEntity>,
    private readonly attributeGroupService: AttributeGroupService,
  ) {}

  async create(
    createAttributeValueDto: CreateAttributeValueDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<AttributeValueEntity> {
    try {
      const attributeGroup = await this.attributeGroupService.findOne(
        createAttributeValueDto.attributeGroup_id,
      );

      if (!attributeGroup) {
        throw new NotFoundException('Attribute Group not found');
      }

      const attributeValueEntity = this.attributeValueRepository.create({
        ...createAttributeValueDto,
        attributeGroup: attributeGroup,
        created_by: jwtPayload.id,
        created_user_name: jwtPayload.userName,
        created_at: new Date(),
      });

      return await this.attributeValueRepository.save(attributeValueEntity);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<AttributeValueEntity[]> {
    try {
      return await this.attributeValueRepository.find({
        relations: ['attributeGroup'],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<AttributeValueEntity> {
    const attributeValue = await this.attributeValueRepository.findOne({
      where: { id, is_active: ActiveStatusEnum.ACTIVE },
      relations: ['attributeGroup'],
    });

    if (!attributeValue) {
      throw new NotFoundException('Attribute Value not found');
    }

    return attributeValue;
  }

  async update(
    id: string,
    updateAttributeValueDto: UpdateAttributeValueDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<AttributeValueEntity> {
    try {
      const attributeValue = await this.findOne(id);

      if (updateAttributeValueDto.attributeGroup_id) {
        const attributeGroup = await this.attributeGroupService.findOne(
          updateAttributeValueDto.attributeGroup_id,
        );

        if (!attributeGroup) {
          throw new NotFoundException('Attribute Group not found');
        }

        attributeValue.attributeGroup = attributeGroup;
      }

      Object.assign(attributeValue, {
        ...updateAttributeValueDto,
        updated_by: jwtPayload.id,
        updated_user_name: jwtPayload.userName,
        updated_at: new Date(),
      });

      return await this.attributeValueRepository.save(attributeValue);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(
    id: string,
    jwtPayload: JwtPayloadInterface,
  ): Promise<AttributeValueEntity> {
    const attributeValue = await this.findOne(id);

    attributeValue.is_active = ActiveStatusEnum.INACTIVE;
    attributeValue.updated_by = jwtPayload.id;
    attributeValue.updated_user_name = jwtPayload.userName;
    attributeValue.updated_at = new Date();

    return await this.attributeValueRepository.save(attributeValue);
  }
}
