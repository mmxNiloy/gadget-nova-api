import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth('jwt')
@Controller({
  path: 'carts',
  version: '1',
})
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Post('add')
  async addToCart(
    @Body() createCartDto: CreateCartDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.cartService.addToCart(createCartDto, jwtPayload);
    return { message: 'Product added to cart', payload };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Delete('remove/:cartId')
  async removeFromCart(
    @Param('cartId') cartId: string,
    @Query('quantity') quantity?: number,
  ) {
    const payload = await this.cartService.removeFromCart(cartId, quantity);
    return { message: 'Item removed from cart', payload };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Delete('clear')
  async clearCart(@UserPayload() jwtPayload: JwtPayloadInterface) {
    const payload = await this.cartService.clearCart(jwtPayload);
    return { message: 'Cart removed', payload };
  }
}
