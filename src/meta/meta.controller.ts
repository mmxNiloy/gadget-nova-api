import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaService } from './meta.service';
import { MetaPaginationDTO } from './dto/meta-pagination.dto';

@ApiTags('Meta')
@Controller({
  path: 'meta',
  version: '1',
})
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('product-count')
  async countProducts(@Query() query: MetaPaginationDTO) {
    const payload = await this.metaService.countProducts(query);

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
