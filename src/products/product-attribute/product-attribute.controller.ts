import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductAttributeService } from './product-attribute.service';
import { AttributeSearchDto, CreateProductAttributeDto } from '../dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from '../dto/update-product-attribute.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('product Attribute')
@Controller({
  path: 'product-attribute',
  version: '1',
})
export class ProductAttributeController {
  constructor(
    private readonly productAttributeService: ProductAttributeService,
  ) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Post()
  async create(
    @Body() dto: CreateProductAttributeDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productAttributeService.create(dto, jwtPayload);
    return { message: 'Product Attribute created successfully', payload };
  }

  @Get()
  async findAll() {
    const payload = await this.productAttributeService.findAll();
    return { message: 'All product attribute lists', payload };
  }

  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() productSearchDto: AttributeSearchDto,
  ) {
    const [payload, total] = await this.productAttributeService.pagination(
      pagination.page,
      pagination.limit,
      pagination.sort as 'DESC' | 'ASC',
      pagination.order,
      productSearchDto,
    );

    return {
      statusCode: 200,
      message: 'Attribute list with pagination',
      payload,
      meta: {
        total: Number(total),
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(Number(total) / pagination.limit),
      },
      error: false,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.productAttributeService.findOne(id);
    return { message: 'Product Attribute details', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductAttributeDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productAttributeService.update(
      id,
      dto,
      jwtPayload,
    );
    return { message: 'Product Attribute updated successfully', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productAttributeService.remove(id, jwtPayload);
    return { message: 'Product Attribute deleted successfully', payload };
  }
}
