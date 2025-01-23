import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';

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
        port: Number(configService.get('DATABASE_PORT')), // Ensures the port is a number
        username: String(configService.get('DATABASE_USER')),
        password: String(configService.get('DATABASE_PASSWORD') ?? ''), // Explicit string conversion
        database: String(configService.get('DATABASE_DB')),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: String(configService.get('DATABASE_SYNCRONIZE')) === 'true', // Convert to boolean
        logging: String(configService.get('DATABASE_LOGGING')) === 'false', // Convert to boolean
        autoLoadEntities: false,
      }),
    }),
    AuthModule,
    UserModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
