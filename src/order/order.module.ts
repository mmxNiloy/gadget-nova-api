import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ShippingInfoModule } from 'src/shipping-info/shipping-info.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, CartEntity, ProductEntity]),ShippingInfoModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
