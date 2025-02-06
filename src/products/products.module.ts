import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandModule } from 'src/brand/brand.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductQuestionsEntity } from './entities/product-questions.entity';
import { ProductEntity } from './entities/product.entity';
import { QuestionAnswersEntity } from './entities/question-answers.entity';
import { ProductsQuestionsController } from './product-questions/products-questions.controller';
import { ProductsQuestionsService } from './product-questions/products-questions.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { QuestionAnswersController } from './question-answers/question-answers.controller';
import { QuestionAnswersService } from './question-answers/question-answers.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductQuestionsEntity, QuestionAnswersEntity]),CategoryModule, BrandModule],
  controllers: [ProductsController,ProductsQuestionsController,QuestionAnswersController],
  providers: [ProductsService,ProductsQuestionsService,QuestionAnswersService],
})
export class ProductsModule {}
