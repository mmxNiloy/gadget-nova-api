import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttributeModule } from './attribute/attribute.module';
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './brand/brand.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { ProductsModule } from './products/products.module';
import { S3Module } from './s3/s3.module';
import { UserModule } from './user/user.module';

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
        synchronize:
          String(configService.get('DATABASE_SYNCRONIZE')) === 'true',
        logging: String(configService.get('DATABASE_LOGGING')) === 'false',
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    BrandModule,
    AttributeModule,
    ProductsModule,
    S3Module,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
