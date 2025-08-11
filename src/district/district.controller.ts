import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guard/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesEnum } from '../common/enums/roles.enum';
import { DistrictService } from './district.service';

@ApiTags('District')
@Controller({
  path: 'districts',
  version: '1',
})
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all districts or search by name',
    description: 'Returns all districts if no name provided, or searches districts by name if name parameter is given'
  })
  @ApiQuery({ 
    name: 'name', 
    required: false, 
    description: 'Optional district name to search for (partial match)',
    example: 'dhaka'
  })
  async findAll(@Query('name') name?: string) {
    const result = await this.districtService.findAll(name);
    
    if (name) {
      return {
        statusCode: 200,
        message: 'District search results',
        payload: result.districts,
        meta: {
          total: result.total
        },
        error: false,
      };
    } else {
      return {
        statusCode: 200,
        message: 'All districts list',
        payload: result.districts,
        meta: {
          total: result.total
        },
        error: false,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get district by ID',
    description: 'Returns a specific district by its unique identifier'
  })
  async findOne(@Param('id') id: string) {
    const district = await this.districtService.findOne(id);
    return { message: 'District details', payload: district };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Patch(':id/delivery-charge')
  @ApiOperation({ 
    summary: 'Update district delivery charge',
    description: 'Updates the delivery charge for a specific district (Admin only)'
  })
  async updateDeliveryCharge(
    @Param('id') id: string,
    @Body() body: { delivery_charge: number },
  ) {
    const district = await this.districtService.updateDeliveryCharge(id, body.delivery_charge);
    return { message: 'Delivery charge updated successfully', payload: district };
  }
} 