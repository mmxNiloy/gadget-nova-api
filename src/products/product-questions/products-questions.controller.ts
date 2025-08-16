import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { CreateProductQuestionsDto } from '../dto/create-product-questions.dto';
import { CreateProductQuestionsSlugDto } from '../dto/create-product-questions-slug.dto';
import { ProductsQuestionsService } from './products-questions.service';

@ApiTags('Product-questions')
@Controller({
  path: 'Product-questions',
  version: '1',
})
export class ProductsQuestionsController {
  constructor(private readonly productsQuestionsService: ProductsQuestionsService) {}
  @Get('product/:slug')
  async findQuestionByProductSlug(@Param('slug') slug: string) {
    const payload = await this.productsQuestionsService.findQuestionsByProductSlug(slug);
    return { message: 'Question details', payload };
  }
  
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductQuestionsDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsQuestionsService.create(createProductDto, jwtPayload);
    return { message: 'Question created successfully', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post('slug')
  async createBySlug(
    @Body() createProductSlugDto: CreateProductQuestionsSlugDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsQuestionsService.createBySlug(createProductSlugDto, jwtPayload);
    return { message: 'Question created successfully', payload };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.productsQuestionsService.findOne(id);
    return { message: 'Question details', payload };
  }

  @Get('product/:id')
  async findQuestionByProduct(@Param('id') id: string) {
    const payload = await this.productsQuestionsService.findQuestionsByProduct(id);
    return { message: 'Question details', payload };
  }


  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsQuestionsService.remove(id, jwtPayload);
    return { message: 'Product deleted successfully', payload };
  }
}
