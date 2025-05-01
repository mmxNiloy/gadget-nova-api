import { Module } from '@nestjs/common';
import { ShippingInfoService } from './shipping-info.service';
import { ShippingInfoController } from './shipping-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingInfoEntity } from './entities/shipping-info.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingInfoEntity]),UserModule],
  controllers: [ShippingInfoController],
  providers: [ShippingInfoService],
  exports: [ShippingInfoService]
})
export class ShippingInfoModule {}
