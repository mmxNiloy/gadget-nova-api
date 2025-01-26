import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Brand')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'brand',
  version: '1',
})
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.brandService.create(createBrandDto, jwtPayload);
    return { message: 'Brand created successfully', payload };
  }

  @Get()
  async findAll() {
    const payload = await this.brandService.findAll();
    return { message: 'All brand lists', payload };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.brandService.findOne(id);
    return { message: 'Brand details', payload };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.brandService.update(id, updateBrandDto, jwtPayload);
    return { message: 'Brand updated successfully', payload };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.brandService.remove(id, jwtPayload);
    return { message: 'Brand deleted successfully', payload };
  }
}
