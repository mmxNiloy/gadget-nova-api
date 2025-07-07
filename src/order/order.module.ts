import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '../cart/entities/cart.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ShippingInfoModule } from '../shipping-info/shipping-info.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, CartEntity, ProductEntity, PaymentEntity]),
    ShippingInfoModule,
    forwardRef(() => PaymentModule)
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
