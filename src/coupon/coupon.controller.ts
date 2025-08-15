import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserPayload } from 'src/common/decorators/user-payload.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('Coupons')
@Controller({
  path: 'coupons',
  version: '1',
})
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  async create(
    @UserPayload() jwtPayload: JwtPayloadInterface,
    @Body() createCouponDto: CreateCouponDto,
  ) {
    try {
      const payload = await this.couponService.create(
        createCouponDto,
        jwtPayload,
      );
      return { message: 'Coupon created successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all active coupons' })
  async findAll() {
    try {
      const payload = await this.couponService.findAll();
      return { message: 'All coupons list', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Get('my-coupons')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: "Get user's available coupons" })
  async getMyCoupons(@UserPayload() jwtPayload: JwtPayloadInterface) {
    try {
      const payload = await this.couponService.getUserCoupons(jwtPayload.id);
      return { message: 'User coupons retrieved successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  async findOne(@Param('id') id: string) {
    try {
      const payload = await this.couponService.findOne(id);
      return { message: 'Coupon retrieved successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code' })
  async findByCode(@Param('code') code: string) {
    try {
      const payload = await this.couponService.findByCode(code);
      return { message: 'Coupon retrieved successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Patch(':id')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Update coupon' })
  async update(
    @Param('id') id: string,
    @Body() updateCouponDto: Partial<CreateCouponDto>,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      const payload = await this.couponService.update(
        id,
        updateCouponDto,
        jwtPayload,
      );
      return { message: 'Coupon updated successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Delete(':id')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Delete coupon' })
  async remove(
    @Param('id') id: string,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      await this.couponService.delete(id, jwtPayload);
      return { message: 'Coupon deleted successfully (soft delete)' };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }

  @Post('apply')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Apply coupon to cart' })
  async applyCoupon(
    @Body() applyCouponDto: ApplyCouponDto,
    @UserPayload() jwtPayload: JwtPayloadInterface,
  ) {
    try {
      // Create a mock user object for the service
      const userId = { id: jwtPayload.id } as any;
      const payload = await this.couponService.verifyCoupon(userId, applyCouponDto);
      return { message: 'Coupon applied successfully', payload };
    } catch (error) {
      throw new BadRequestException(error?.response?.message || error.message);
    }
  }
}
