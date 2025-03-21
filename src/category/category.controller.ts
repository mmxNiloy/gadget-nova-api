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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CategoryService } from './category.service';
import {
  CategorySearchDto,
  CreateCategoryDto,
} from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('Category')
@Controller({
  path: 'category',
  version: '1',
})
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.categoryService.create(
        createCategoryDto,
        jwtPayload,
      );
      return { message: 'Category created successfuly', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }

  @Get()
  @ApiQuery({ name: 'name', required: false, type: String })
  async findAll(@Query('name') name?: string) {
    try {
      const payload = await this.categoryService.findAll(name);
      return { message: 'All category lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('subcategories')
  @ApiQuery({ name: 'name', required: false, type: String })
  async findAllSubcategories(@Query('name') name?: string) {
    try {
      const payload = await this.categoryService.findAllSubcategories(name);
      return { message: 'All subcategory lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('subcategories/:categoryId')
  async findSubcategoriesByCategory(@Param('categoryId') categoryId: string) {
    try {
      const payload =
        await this.categoryService.findSubcategoriesByCategory(categoryId);
      return { message: 'Subcategories by category ID', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() categorySearchDto: CategorySearchDto,
  ) {
    const [payload, total] = await this.categoryService.pagination(
      pagination.page,
      pagination.limit,
      pagination.sort as 'DESC' | 'ASC',
      pagination.order,
      categorySearchDto,
    );

    return {
      statusCode: 200,
      message: 'Category list with pagination',
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
    try {
      const payload = await this.categoryService.findOne(id);
      return { message: 'Category details', payload };
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
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.categoryService.update(
        id,
        updateCategoryDto,
        jwtPayload,
      );
      console.log({ payload });

      return { message: 'Category updated successfully', payload };
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
      const payload = await this.categoryService.remove(id, jwtPayload);
      return { message: 'Category deleted successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
