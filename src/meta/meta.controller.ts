import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('Meta')
@Controller({
  path: 'meta',
  version: '1',
})
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

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
