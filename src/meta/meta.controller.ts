import { Controller, Get, Query } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('Meta')
@Controller({
  path: 'meta',
  version: '1',
})
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @ApiProperty({
    description: 'data limit',
    minimum: 1,
    default: 10,
    required: false,
    type: Number,
  })
  @Get('product-count')
  async countProducts(@Query('limit') limit: number) {
    const payload = await this.metaService.countProducts(limit);

    return {
      message: 'Product count and page count',
      payload,
    };
  }

  @Get('product-slugs')
  async getAllProductSlugs() {
    const payload = await this.metaService.getAllProductSlugs();

    return {
      message: 'All product slugs list',
      payload,
    };
  }

  @Get('category-slugs')
  async getAllBaseCategorySlugs() {
    const payload = await this.metaService.getAllBaseCategorySlugs();

    return {
      message: 'All base category slugs list',
      payload,
    };
  }
}
