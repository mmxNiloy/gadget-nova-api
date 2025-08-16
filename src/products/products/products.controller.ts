import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CreateProductDto, ProductSearchDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsService } from './products.service';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('Product')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'gallery', maxCount: 5 },
    ]),
  )
  @ApiBody({ type: CreateProductDto })
  async create(
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body() createProductDto: CreateProductDto,
  ) {
    const productData = {
      ...createProductDto,
      thumbnail: files.thumbnail ? files.thumbnail[0] : null,
      gallery: files.gallery ? files.gallery : [],
    };

    const payload = await this.productsService.create(productData, jwtPayload);
    return { message: 'Product created successfully', payload };
  }

  @Get()
  @ApiQuery({ name: 'title', required: false, type: String })
  async findAll(@Query('title') title?: string) {
    try {
      const payload = await this.productsService.findAll(title);
      return { message: 'All products lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() productSearchDto: ProductSearchDto,
  ) {
    console.log('Received Pagination Params:', pagination);
    console.log('Received Search Params:', productSearchDto);
    const [payload, total] = await this.productsService.pagination(
      pagination.page,
      pagination.limit,
      pagination.sort as 'DESC' | 'ASC',
      pagination.order,
      productSearchDto,
    );

    return {
      statusCode: 200,
      message: 'Product list with pagination',
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

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    try {
      const payload = await this.productsService.findBySlug(slug);
      return { message: 'Product details by slug', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.productsService.findOne(id);
    return { message: 'Product details', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'gallery', maxCount: 5 },
    ]),
  )
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const productData = { ...updateProductDto };

    if (files.thumbnail?.length) {
      productData.thumbnail = files.thumbnail[0];
    }

    if (files.gallery?.length) {
      productData.gallery = files.gallery;
    }

    console.log('productData', productData);

    const updatedProduct = await this.productsService.update(
      id,
      productData,
      jwtPayload,
    );

    return { message: 'Product updated successfully', payload: updatedProduct };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.productsService.remove(id, jwtPayload);
    return { message: 'Product deleted successfully', payload };
  }
}
