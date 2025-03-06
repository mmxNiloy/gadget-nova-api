import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeModule } from 'src/attribute/attribute.module';
import { BrandModule } from 'src/brand/brand.module';
import { CategoryModule } from 'src/category/category.module';
import { S3Module } from 'src/s3/s3.module';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { ProductQuestionsEntity } from './entities/product-questions.entity';
import { ProductRatingEntity } from './entities/product-rating.entity';
import { ProductEntity } from './entities/product.entity';
import { QuestionAnswersEntity } from './entities/question-answers.entity';
import { ProductAttributeController } from './product-attribute/product-attribute.controller';
import { ProductAttributeService } from './product-attribute/product-attribute.service';
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
      ProductAttributeEntity,
    ]),
    CategoryModule,
    BrandModule,
    S3Module,
    AttributeModule,
  ],
  controllers: [
    ProductAttributeController,
    ProductsController,
    ProductsQuestionsController,
    QuestionAnswersController,
    ProductsRatingsController,
  ],
  providers: [
    ProductAttributeService,
    ProductsService,
    ProductsQuestionsService,
    QuestionAnswersService,
    ProductsRatingsService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
