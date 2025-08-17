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
    return await this.metaService.getAllProductSlugs();
  }

  @Get('category-slugs')
  async getAllBaseCategorySlugs() {
    return await this.metaService.getAllBaseCategorySlugs();
  }
}
