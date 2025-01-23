import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Category')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'category',
  version: '1',
})
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto,
  @UserPayload() jwtPayload: JwtPayloadInterface) {
    try {
      const payload= await this.categoryService.create(createCategoryDto,jwtPayload);
      return {message:"Category created successfuly", payload}
    } catch (error) {
      throw new BadRequestException(error.response.message)
    }
  }

  @Get()
  async findAll() {
    try {
      const payload = await this.categoryService.findAll()
      return {message: "All category lists", payload}
    } catch (error) {
      throw new BadRequestException(error?.response?.message)
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const payload = await this.categoryService.findOne(id)
      return {message: "Category details", payload}
    } catch (error) {
      throw new BadRequestException(error?.response?.message)
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto,@UserPayload() jwtPayload: JwtPayloadInterface) {
    try {
      const payload = await this.categoryService.update(id,updateCategoryDto,jwtPayload)
      console.log({payload});
      
      return {message: "Category updated successfully", payload }
    } catch (error) {
      throw new BadRequestException(error?.response?.message)
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string,@UserPayload() jwtPayload: JwtPayloadInterface) {
    try {
      const payload = await this.categoryService.remove(id,jwtPayload);
      return {message: "Category deleted successfully", payload }
    } catch (error) {
      throw new BadRequestException(error?.response?.message)
    }
    
  }
}
