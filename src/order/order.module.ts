import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '../cart/entities/cart.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { UserEntity } from '../user/entities/user.entity/user.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ShippingInfoModule } from '../shipping-info/shipping-info.module';
import { PaymentModule } from '../payment/payment.module';
import { DistrictModule } from '../district/district.module';
import { SmsModule } from '../sms/sms.module';
import { OtpService } from '../common/services/otp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, CartEntity, ProductEntity, PaymentEntity, UserEntity]),
    ShippingInfoModule,
    DistrictModule,
    SmsModule,
    forwardRef(() => PaymentModule)
  ],
  controllers: [OrderController],
  providers: [OrderService, OtpService],
  exports: [OrderService]
})
export class OrderModule {}
