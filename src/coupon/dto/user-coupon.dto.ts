import { CouponTypeEnum } from "src/common/enums/coupon-type.enum";
import { CouponUsageTypeEnum } from "src/common/enums/coupon-usage-type.enum";

export class UserCouponDto {
    id: string;
    couponCode: string;
    description?: string;
    couponType: CouponTypeEnum;
    couponValue: number;
    maximumDiscountLimit?: number;
    minimumOrderAmount: number;
    startDate: Date;
    endDate: Date;
    usageLimitPerUser: number;
    applyCount: number;
    redeemCount: number;
    couponUsageType: CouponUsageTypeEnum;
  
    remainingUsage: number;
  }
  