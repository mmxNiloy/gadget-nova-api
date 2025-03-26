import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CreateOrderDto, OrderSearchDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './order.service';
import { PaginationDecorator } from 'src/common/decorators/pagination.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination/pagination.dto';
import { UpdateOrderStatusDto } from './dto/update-orser-status.dto';

@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiBearerAuth('jwt')
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

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Get('pagination')
  async pagination(
    @PaginationDecorator() pagination: PaginationDTO,
    @Query() orderSearchDto: OrderSearchDto,
  ) {
    const [payload, total] = await this.orderService.pagination(
      pagination.page,
      pagination.limit,
      pagination.sort as 'DESC' | 'ASC',
      pagination.order,
      orderSearchDto,
    );

    return {
      statusCode: 200,
      message: 'Order list with pagination',
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

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payload = await this.orderService.findOne(id);
    return { message: 'Order details', payload };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Put('update-status/:orderId')
  @ApiBody({ type: UpdateOrderStatusDto })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(
      orderId,
      updateOrderStatusDto.status,
    );
    return { message: 'Order status updated successfully', order };
  }
}
