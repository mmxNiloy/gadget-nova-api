import { Injectable } from '@nestjs/common';
import { CreateShippingInfoDto } from './dto/create-shipping-info.dto';
import { UpdateShippingInfoDto } from './dto/update-shipping-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShippingInfoEntity } from './entities/shipping-info.entity';
import { Repository } from 'typeorm';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ShippingInfoService {
  constructor(
    @InjectRepository(ShippingInfoEntity)
    private readonly shippingInfoRepository: Repository<ShippingInfoEntity>,
    private readonly userService: UserService
  ) {}

  async create(
    createShippingInfoDto: CreateShippingInfoDto,
    jwtPayload: JwtPayloadInterface,
  ):Promise<ShippingInfoEntity> {
    const user = await this.userService.findById(jwtPayload.id)

    const shippingInfoEntity = this.shippingInfoRepository.create({
      ...createShippingInfoDto,
      user:user,
      created_at: new Date(),
      created_by: jwtPayload.id,
      created_user_name: jwtPayload.userName,
    });

    return await this.shippingInfoRepository.save(shippingInfoEntity);
  }
}
