import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from './entities/promotion.entity';
import { ProductsModule } from 'src/products/products.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromotionEntity,
    ]),
    ProductsModule,
    S3Module,
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
})
export class PromotionModule {}
