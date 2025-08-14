import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { JwtPayloadInterface } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async updatePayment(
    paymentId: string,
    updatePaymentDto: UpdatePaymentDto,
    jwtPayload: JwtPayloadInterface,
  ): Promise<PaymentEntity> {
    // Check if user is super admin
    if (jwtPayload.role !== RolesEnum.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can update payment details');
    }

    // Find the payment
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if payment status is already PAID
    if (payment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot update payment details when payment status is PAID');
    }

    // Only allow updating paymentMethod and paymentStatus for super admin
    // Other fields can be updated normally
    const allowedFields = ['paymentMethod', 'paymentStatus'];
    const restrictedFields = Object.keys(updatePaymentDto).filter(
      key => allowedFields.includes(key)
    );

    // Update the payment
    Object.assign(payment, {
      ...updatePaymentDto,
      updated_by: jwtPayload.id,
      updated_user_name: jwtPayload.userName,
      updated_at: new Date(),
    });

    // Save the updated payment
    const updatedPayment = await this.paymentRepository.save(payment);

    return updatedPayment;
  }

  async findOne(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'order.user', 'order.shippingInfo'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
} 