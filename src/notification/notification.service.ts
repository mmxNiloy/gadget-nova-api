import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async sendOrderPlacedNotification(order: OrderEntity): Promise<void> {
    try {
      // Get contact info with priority: user table first, then shipping info
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderPlacedEmail(order, contactInfo.email);
          this.logger.log(`Order placed email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order placed email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderPlacedSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order placed SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order placed SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order placed notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderCancelledNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderCancelledEmail(order, contactInfo.email);
          this.logger.log(`Order cancelled email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order cancelled email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderCancelledSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order cancelled SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order cancelled SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order cancelled notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderShippedNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderShippedEmail(order, contactInfo.email);
          this.logger.log(`Order shipped email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order shipped email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderShippedSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order shipped SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order shipped SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order shipped notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderConfirmedNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderConfirmedEmail(order, contactInfo.email);
          this.logger.log(`Order confirmed email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order confirmed email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderConfirmedSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order confirmed SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order confirmed SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order confirmed notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderOnHoldNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderOnHoldEmail(order, contactInfo.email);
          this.logger.log(`Order on hold email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order on hold email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderOnHoldSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order on hold SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order on hold SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order on hold notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderDeliveredNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderDeliveredEmail(order, contactInfo.email);
          this.logger.log(`Order delivered email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order delivered email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderDeliveredSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order delivered SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order delivered SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order delivered notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderPaidNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderPaidEmail(order, contactInfo.email);
          this.logger.log(`Order paid email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order paid email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderPaidSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order paid SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order paid SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order paid notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderFailedNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderFailedEmail(order, contactInfo.email);
          this.logger.log(`Order failed email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order failed email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderFailedSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order failed SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order failed SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order failed notifications for order ${order.orderId}:`, error);
    }
  }

  async sendOrderPendingNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.orderId}`);
        return;
      }

      // Send only email if user has email, otherwise send SMS
      if (contactInfo.hasEmail) {
        try {
          await this.mailService.sendOrderPendingEmail(order, contactInfo.email);
          this.logger.log(`Order pending email sent successfully for order ${order.orderId} to ${contactInfo.email}`);
        } catch (error) {
          this.logger.error(`Failed to send order pending email for order ${order.orderId} to ${contactInfo.email}:`, error);
        }
      } else if (contactInfo.hasPhone) {
        // Only send SMS if no email available
        try {
          const message = this.generateOrderPendingSmsMessage(order);
          await this.smsService.sendSms(contactInfo.phone, message);
          this.logger.log(`Order pending SMS sent successfully for order ${order.orderId} to ${contactInfo.phone}`);
        } catch (error) {
          this.logger.error(`Failed to send order pending SMS for order ${order.orderId} to ${contactInfo.phone}:`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending order pending notifications for order ${order.orderId}:`, error);
    }
  }

  /**
   * Get contact information with priority: user table first, then shipping info
   */
  private getContactInfo(order: OrderEntity): {
    email: string;
    phone: string;
    hasEmail: boolean;
    hasPhone: boolean;
  } {
    // Priority 1: User table contact info
    const userEmail = order.user?.email;
    const userPhone = order.user?.phone;
    
    // Priority 2: Shipping info contact info (fallback)
    const shippingEmail = order.shippingInfo?.email;
    const shippingPhone = order.shippingInfo?.phone;
    
    // Use user info if available, otherwise fallback to shipping info
    const email = userEmail || shippingEmail;
    const phone = userPhone || shippingPhone;
    
    const hasEmail = email && email.includes('@');
    const hasPhone = phone && phone.length > 0;
    
    this.logger.log(`Contact info for order ${order.orderId}: User email: ${userEmail || 'N/A'}, User phone: ${userPhone || 'N/A'}, Shipping email: ${shippingEmail || 'N/A'}, Shipping phone: ${shippingPhone || 'N/A'}, Final email: ${email || 'N/A'}, Final phone: ${phone || 'N/A'}`);
    
    return {
      email: email || '',
      phone: phone || '',
      hasEmail,
      hasPhone,
    };
  }

  private generateOrderPlacedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    // Use the final total from order entity (which already includes coupon discount)
    const total = parseFloat(order.totalPrice.toString());
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been placed successfully. Total: ৳${total.toFixed(2)}. Payment: ${paymentMethod}. - Gadget Nova`;
  }

  private generateOrderCancelledSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been cancelled. Payment was: ${paymentMethod}. Contact us for any questions. - Gadget Nova`;
  }

  private generateOrderShippedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been shipped and is on its way! Payment was: ${paymentMethod}. Track it in your dashboard. - Gadget Nova`;
  }

  private generateOrderOnHoldSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} is on hold. Payment was: ${paymentMethod}. We'll review and update you soon. - Gadget Nova`;
  }

  private generateOrderConfirmedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been confirmed and is being processed. Payment was: ${paymentMethod}. We'll ship it soon! - Gadget Nova`;
  }

  private generateOrderDeliveredSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been delivered successfully! Payment was: ${paymentMethod}. Thank you for choosing Gadget Nova! - Gadget Nova`;
  }

  private generateOrderPaidSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} payment has been received successfully! Payment method: ${paymentMethod}. Your order is now being processed. - Gadget Nova`;
  }

  private generateOrderFailedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} payment has failed. Payment method was: ${paymentMethod}. Please contact us for assistance. - Gadget Nova`;
  }

  private generateOrderPendingSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.orderId;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} is now pending. Payment method: ${paymentMethod}. We'll update you on the status soon. - Gadget Nova`;
  }
} 