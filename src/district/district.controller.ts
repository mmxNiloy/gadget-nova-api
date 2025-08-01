import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guard/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesEnum } from '../common/enums/roles.enum';
import { PaginationDecorator } from '../common/decorators/pagination.decorator';
import { PaginationDTO } from '../common/dtos/pagination/pagination.dto';
import { DistrictService } from './district.service';

@ApiTags('District')
@Controller({
  path: 'districts',
  version: '1',
})
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Get()
  async findAll(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query('name') name?: string,
  ) {
    const result = await this.districtService.findAll(pagination, name);
    return {
      statusCode: 200,
      message: 'District list with pagination',
      payload: result.districts,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      error: false,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const district = await this.districtService.findOne(id);
    return { message: 'District details', payload: district };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Patch(':id/delivery-charge')
  async updateDeliveryCharge(
    @Param('id') id: string,
    @Body() body: { delivery_charge: number },
  ) {
    const district = await this.districtService.updateDeliveryCharge(id, body.delivery_charge);
    return { message: 'Delivery charge updated successfully', payload: district };
  }
} 