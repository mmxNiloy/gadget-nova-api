import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, PromotionSearchDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('promotion')
@Controller({
  path: 'promotions',
  version: '1',
})
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}
  
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'promotionImage', maxCount: 1 },
    ]),
  )
  @ApiBody({ type: CreatePromotionDto })
  async create(
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @UploadedFiles()
    files: {
      promotionImage?: Express.Multer.File[];
    },@Body() createPromotionDto: CreatePromotionDto) {
    const promotionData = {
      ...createPromotionDto,
      promotionImage: files.promotionImage?files.promotionImage[0]: null
    }
    
    const payload = await this.promotionService.create(promotionData,jwtPayload)
    return { message: 'Promotion created successfully', payload };

  }

  @Get()
  async findAll() {
    try {
      const payload = await this.promotionService.findAll();
      return { message: 'All promotions lists', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message);
    }
  }

  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() promotionSearchDto: PromotionSearchDto,
  ) {
    const [payload, total] = await this.promotionService.pagination(
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
    const payload = await this.promotionService.findOne(id);
    return { message: 'Promotion details', payload };
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(+id, updatePromotionDto);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.EDITOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.promotionService.remove(id, jwtPayload);
    return { message: 'Promotion deleted successfully', payload };
  }
}
