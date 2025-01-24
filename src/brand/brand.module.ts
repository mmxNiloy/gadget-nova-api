import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandEntity } from './entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity]),CategoryModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
