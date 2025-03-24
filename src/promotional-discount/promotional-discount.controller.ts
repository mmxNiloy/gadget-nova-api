import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { PromotionalDiscountService } from './promotional-discount.service';
import { CreatePromotionalDiscountDto, PromotionSearchDto } from './dto/create-promotional-discount.dto';
import { UpdatePromotionalDiscountDto } from './dto/update-promotional-discount.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('Promotional discount')
@Controller({
  path: 'promotional-discount',
  version: '1',
})

export class PromotionalDiscountController {
  constructor(private readonly promotionalDiscountService: PromotionalDiscountService) {}
  
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createPromotionalDiscountDto: CreatePromotionalDiscountDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.promotionalDiscountService.create(
        createPromotionalDiscountDto,
        jwtPayload,
      );
      return { message: 'Promotion created successfuly', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }

  @Get()
  @ApiQuery({ name: 'title', required: false, type: String })
  async findAll(@Query('title') title?: string) {
    try {
      const payload = await this.promotionalDiscountService.findAll(title);
      return { message: 'All Promotion lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() promotionSearchDto: PromotionSearchDto,
  ) {
    const [payload, total] = await this.promotionalDiscountService.pagination(
      pagination.page,
      pagination.limit,
      pagination.sort as 'DESC' | 'ASC',
      pagination.order,
      promotionSearchDto,
    );

    return {
      statusCode: 200,
      message: 'Promotion list with pagination',
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
      const payload = await this.promotionalDiscountService.findOne(id);
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
    @Body() updatePromotionalDiscountDto: UpdatePromotionalDiscountDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.promotionalDiscountService.update(
        id,
        updatePromotionalDiscountDto,
        jwtPayload,
      );
      console.log({ payload });

      return { message: 'Promotion updated successfully', payload };
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
      const payload = await this.promotionalDiscountService.remove(id, jwtPayload);
      return { message: 'Promotion deleted successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }
}
