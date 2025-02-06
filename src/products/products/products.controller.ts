import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('Product')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsService.create(createProductDto, jwtPayload);
    return { message: 'Product created successfully', payload };
  }

  @Get()
  async findAll() {
    const payload = await this.productsService.findAll();
    return { message: 'All products lists', payload };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.productsService.findOne(id);
    return { message: 'Product details', payload };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsService.update(id, updateProductDto, jwtPayload);
    return { message: 'Product updated successfully', payload };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsService.remove(id, jwtPayload);
    return { message: 'Product deleted successfully', payload };
  }
}
