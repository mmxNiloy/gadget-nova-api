import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CreateShippingInfoDto } from './dto/create-shipping-info.dto';
import { ShippingInfoService } from './shipping-info.service';

@ApiTags('ShippingInfo')
@Controller({
  path: 'shipping-info',
  version: '1',
})
export class ShippingInfoController {
  constructor(private readonly shippingInfoService: ShippingInfoService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.USER)
  @Post()
  async create(
    @Body() createShippingInfoDto: CreateShippingInfoDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.shippingInfoService.create(
        createShippingInfoDto,
        jwtPayload,
      );
      return { message: 'Shipping Info created successfuly', payload };
    } catch (error) {
      throw new BadRequestException(error.response.message);
    }
  }
}
