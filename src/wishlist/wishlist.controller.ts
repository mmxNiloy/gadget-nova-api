import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { WishlistService } from './wishlist.service';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';

@ApiTags('Wishlist')
@Controller({
  path: 'wishlist',
  version: '1',
})
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // 1️⃣ Add product to wishlist
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Post(':productId')
  async create(
    @Param('productId') productId: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.wishlistService.create(productId, jwtPayload);
      return { message: 'Product added to wishlist', payload };
    } catch (error) {
      throw new BadRequestException(error.response?.message || error.message);
    }
  }

  // 2️⃣ Remove product from wishlist
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Delete(':productId')
  async remove(
    @Param('productId') productId: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.wishlistService.remove(productId, jwtPayload);
      return { message: 'Product removed from wishlist', payload };
    } catch (error) {
      throw new BadRequestException(error.response?.message || error.message);
    }
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Get('pagination')
  async getWishlistPaginated(
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @PaginationDecorator() pagination: PaginationDTO,
  ) {
    const [payload, total] =
      await this.wishlistService.getUserWishlistPaginated(
        jwtPayload,
        pagination.page,
        pagination.limit,
        pagination.sort as 'ASC' | 'DESC',
        pagination.order,
      );

    return {
      statusCode: 200,
      message: 'User wishlist with pagination',
      payload,
      meta: {
        total: Number(total),
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(Number(total) / pagination.limit),
      },
      error: false,
    };
  }

  // 4️⃣ Get all users who wishlisted a product
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Get('/product/:productId/users')
  async getWishlisersByProduct(@Param('productId') productId: string) {
    try {
      const payload =
        await this.wishlistService.getWishlisersByProduct(productId);
      return { message: 'Users who wishlisted this product', payload };
    } catch (error) {
      throw new BadRequestException(error.response?.message || error.message);
    }
  }
}
