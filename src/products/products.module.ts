import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandModule } from 'src/brand/brand.module';
import { CategoryModule } from 'src/category/category.module';
import { S3Module } from 'src/s3/s3.module';
import { ProductQuestionsEntity } from './entities/product-questions.entity';
import { ProductRatingEntity } from './entities/product-rating.entity';
import { ProductEntity } from './entities/product.entity';
import { QuestionAnswersEntity } from './entities/question-answers.entity';
import { ProductsQuestionsController } from './product-questions/products-questions.controller';
import { ProductsQuestionsService } from './product-questions/products-questions.service';
import { ProductsRatingsController } from './product-ratings/products-ratings.controller';
import { ProductsRatingsService } from './product-ratings/products-ratings.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { QuestionAnswersController } from './question-answers/question-answers.controller';
import { QuestionAnswersService } from './question-answers/question-answers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductQuestionsEntity,
      QuestionAnswersEntity,
      ProductRatingEntity,
    ]),
    CategoryModule,
    BrandModule,
    S3Module,
  ],
  controllers: [
    ProductsController,
    ProductsQuestionsController,
    QuestionAnswersController,
    ProductsRatingsController,
  ],
  providers: [
    ProductsService,
    ProductsQuestionsService,
    QuestionAnswersService,
    ProductsRatingsService,
  ],
  exports: [ProductsService]
})
export class ProductsModule {}
