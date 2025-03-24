import { PartialType } from '@nestjs/swagger';
import { CreatePromotionalDiscountDto } from './create-promotional-discount.dto';

export class UpdatePromotionalDiscountDto extends PartialType(CreatePromotionalDiscountDto) {}
