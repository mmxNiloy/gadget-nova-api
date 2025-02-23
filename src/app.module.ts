import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductsModule } from './products/products.module';
import { S3Module } from './s3/s3.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: String(configService.get('DATABASE_HOST')),
        port: Number(configService.get('DATABASE_PORT')), 
        username: String(configService.get('DATABASE_USER')),
        password: String(configService.get('DATABASE_PASSWORD') ?? ''), 
        database: String(configService.get('DATABASE_DB')),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: String(configService.get('DATABASE_SYNCRONIZE')) === 'true',
        logging: String(configService.get('DATABASE_LOGGING')) === 'false',
        autoLoadEntities: false,
      }),
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    BrandModule,
    ProductsModule,
    S3Module,
    CartModule,
    OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
