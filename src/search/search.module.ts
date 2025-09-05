import { Module } from '@nestjs/common';
import {ElasticsearchService} from './elasticsearh.service'

@Module({
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class SearchModule {}
