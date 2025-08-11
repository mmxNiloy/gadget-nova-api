import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PGWContext } from './pgw.context';
import { CodStrategy } from './strategies/cod-strategy';
import { SslStrategy } from './strategies/ssl-strategy';
import { BkashStrategy } from './strategies/bkash-strategy';
import { SslCommerzService } from './services/ssl-commerz.service';
import { BkashPaymentService } from './bkash-payment.service';
import { PaymentController } from './payment.controller';
import { PaymentEntity } from './entities/payment.entity';
import { OrderModule } from '../order/order.module';
import { RedisModule } from '../config/redis.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    forwardRef(() => OrderModule),
    RedisModule,
    NotificationModule,
  ],
  controllers: [PaymentController],
  providers: [
    CodStrategy, 
    SslStrategy, 
    BkashStrategy,
    PGWContext, 
    SslCommerzService,
    BkashPaymentService
  ],
  exports: [PGWContext, SslCommerzService, BkashPaymentService],
})
export class PaymentModule {}
