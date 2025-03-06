import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CreateAttributeGroupDto } from '../dto/create-attribute-group.dto';
import { UpdateAttributeGroupDto } from '../dto/update-attribute-group.dto';
import { AttributeGroupService } from './attribute-group.service';

@ApiTags('Attribute-group')
@Controller({
  path: 'attribute-group',
  version: '1',
})
export class AttributeGroupController {
  constructor(private readonly attributeGroupService: AttributeGroupService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createAttributeGroupDto: CreateAttributeGroupDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = this.attributeGroupService.create(
        createAttributeGroupDto,
        jwtPayload,
      );
      return { message: 'Attribute Group created successfuly', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }

  @Get()
  async findAll() {
    try {
      const payload = await this.attributeGroupService.findAll();
      return { message: 'All Attribute Group lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const payload = await this.attributeGroupService.findOne(id);
      return { message: 'Attribute Group details', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttributeGroupDto: UpdateAttributeGroupDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.attributeGroupService.update(
        id,
        updateAttributeGroupDto,
        jwtPayload,
      );
      return { message: 'Attribute Group updated successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.attributeGroupService.remove(id, jwtPayload);
      return { message: 'Attribute Group deleted successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
