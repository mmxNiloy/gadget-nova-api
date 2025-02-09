import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ApiFile } from 'src/common/decorators/api-file.decorator';
import { ApiFiles } from 'src/common/decorators/api-files.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  async create(
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @UploadedFile() thumbnail: Express.Multer.File,
    @UploadedFiles() gallery: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    const payload = await this.productsService.create(createProductDto, jwtPayload, thumbnail, gallery);
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
  @ApiFile('thumbnail', false)
  @ApiFiles('gallery', false)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @UploadedFile() thumbnail?: Express.Multer.File,
    @UploadedFiles() gallery?: Express.Multer.File[],
  ) {
    const payload = await this.productsService.update(id, updateProductDto, jwtPayload, thumbnail, gallery);
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
