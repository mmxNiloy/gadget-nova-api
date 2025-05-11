import { JwtPayloadInterface } from "src/auth/interfaces/jwt-payload.interface";
import { CreateOrderDto } from "src/order/dto/create-order.dto";
import { OrderEntity } from "src/order/entities/order.entity";

export interface PaymentStrategy {
    pay(order: OrderEntity, dto: CreateOrderDto, jwt: JwtPayloadInterface): Promise<{
      providerResponse: any;
    }>;
  }
  