import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { CreateProductRatingsDto } from '../dto/create-product-rating.dto';
import { ProductsRatingsService } from './products-ratings.service';

@ApiTags('Product-ratings')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'Product-ratings',
  version: '1',
})
export class ProductsRatingsController {
  constructor(private readonly productsRatingsService: ProductsRatingsService) {}

  @Post()
  async create(
    @Body() createProductRatingsDto: CreateProductRatingsDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsRatingsService.create(createProductRatingsDto, jwtPayload);
    return { message: 'Rating created successfully', payload };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.productsRatingsService.findOne(id);
    return { message: 'Rating details', payload };
  }

  @Get('product/:id')
  async findRatingByProduct(@Param('id') id: string) {
    const payload = await this.productsRatingsService.findRatingsByProduct(id);
    return { message: 'Rating details', payload };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsRatingsService.remove(id, jwtPayload);
    return { message: 'Rating deleted successfully', payload };
  }
}
