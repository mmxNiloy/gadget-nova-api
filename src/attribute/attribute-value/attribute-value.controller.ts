import {
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
import { CreateAttributeValueDto } from '../attribute-group/dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from '../attribute-group/dto/update-attribute-value.dto';
import { AttributeValueService } from './attribute-value.service';

@ApiTags('Attribute-value')
@Controller({
  path: 'attribute-value',
  version: '1',
})
export class AttributeValueController {
  constructor(private readonly attributeValueService: AttributeValueService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createAttributeValueDto: CreateAttributeValueDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.attributeValueService.create(
      createAttributeValueDto,
      jwtPayload,
    );
    return { message: 'Attribute value created successfully', payload };
  }

  @Get()
  async findAll() {
    const payload = await this.attributeValueService.findAll();
    return { message: 'All attribute value lists', payload };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.attributeValueService.findOne(id);
    return { message: 'Attribute value details', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttributeValueDto: UpdateAttributeValueDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.attributeValueService.update(
      id,
      updateAttributeValueDto,
      jwtPayload,
    );
    return { message: 'Attribute value updated successfully', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.attributeValueService.remove(id, jwtPayload);
    return { message: 'Attribute value deleted successfully', payload };
  }
}
