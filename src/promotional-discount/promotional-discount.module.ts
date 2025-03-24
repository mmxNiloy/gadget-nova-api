import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { PromotionalDiscountEntity } from './entities/promotional-discount.entity';
import { PromotionalDiscountController } from './promotional-discount.controller';
import { PromotionalDiscountService } from './promotional-discount.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionalDiscountEntity]),ProductsModule],
  controllers: [PromotionalDiscountController],
  providers: [PromotionalDiscountService],
  exports: [PromotionalDiscountService]
})
export class PromotionalDiscountModule {}
