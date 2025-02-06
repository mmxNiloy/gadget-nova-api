import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandModule } from 'src/brand/brand.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductQuestionsEntity } from './entities/product-questions.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductsQuestionsController } from './products-questions.controller';
import { ProductsQuestionsService } from './products-questions.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductQuestionsEntity]),CategoryModule, BrandModule],
  controllers: [ProductsController,ProductsQuestionsController],
  providers: [ProductsService,ProductsQuestionsService],
})
export class ProductsModule {}
