import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/products/entities/product.entity';

@Injectable()
export class PromoDiscountUtil {
  filterActivePromo(product: ProductEntity): any {
    const currentDate = new Date();

    const activePromo = product.promotionalDiscounts.find(
      (promo) =>
        promo.is_active === 1 &&
        new Date(promo.startDate) <= currentDate &&
        new Date(promo.endDate) >= currentDate
    );

    if (!activePromo) {
      return {
        promoAmount: null,
        promoStartDate: null,
        promoEndDate: null,
        isPromoPercentage: null,
      };
    }

    const promoAmount = activePromo.is_percentage
      ? product.regularPrice - (product.regularPrice * activePromo.amount) / 100 // Percentage-based discount
      : product.regularPrice - activePromo.amount; // Fixed amount discount

    return {
      promoAmount: parseFloat(promoAmount.toFixed(2)), // Ensure 2 decimal places
      promoStartDate: activePromo.startDate,
      promoEndDate: activePromo.endDate,
      isPromoPercentage: activePromo.is_percentage,
    };
  }
}
