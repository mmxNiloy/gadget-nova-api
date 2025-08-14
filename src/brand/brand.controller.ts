import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { BrandService } from './brand.service';
import { BrandSearchDto, CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('Brand')
@Controller({
  path: 'brand',
  version: '1',
})
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Post()
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.brandService.create(createBrandDto, jwtPayload);
    return { message: 'Brand created successfully', payload };
  }

  @Get()
  @ApiQuery({ name: 'name', required: false, type: String })
  async findAll(@Query('name') name?: string) {
    try {
      const payload = await this.brandService.findAll(name);
      return { message: 'All brand lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() brandSearchDto: BrandSearchDto,
  ) {
    const [payload, total] = await this.brandService.pagination(
      pagination.page,
      pagination.limit,
      pagination.sort as 'DESC' | 'ASC',
      pagination.order,
      brandSearchDto,
    );

    return {
      statusCode: 200,
      message: 'Brand list with pagination',
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
      const payload = await this.brandService.findBySlug(slug);
      return { message: 'Brand details by slug', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.brandService.findOne(id);
    return { message: 'Brand details', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.brandService.update(
      id,
      updateBrandDto,
      jwtPayload,
    );
    return { message: 'Brand updated successfully', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.brandService.remove(id, jwtPayload);
    return { message: 'Brand deleted successfully', payload };
  }
}
