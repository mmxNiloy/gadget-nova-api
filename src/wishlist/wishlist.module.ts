import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from 'src/products/products.module';
import { MailModule } from 'src/mail/mail.module';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity, 
    ]), 
    ProductsModule,
    MailModule
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService]
})
export class WishlistModule {}
