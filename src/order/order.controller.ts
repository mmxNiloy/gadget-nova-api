import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Post('create')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    const payload = await this.orderService.createOrder(
      createOrderDto,
      jwtPayload,
    );
    return { message: 'Order created successfully', payload };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update-status/:orderId')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    const order = await this.orderService.updateOrderStatus(orderId, status);
    return { message: 'Order status updated successfully', order };
  }
}
