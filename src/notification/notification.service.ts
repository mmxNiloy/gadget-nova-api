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
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderPlacedEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order placed email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order placed email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderPlacedSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order placed SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order placed SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order placed notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order placed notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderCancelledNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderCancelledEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order cancelled email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order cancelled email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderCancelledSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order cancelled SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order cancelled SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order cancelled notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order cancelled notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderShippedNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderShippedEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order shipped email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order shipped email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderShippedSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order shipped SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order shipped SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order shipped notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order shipped notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderConfirmedNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderConfirmedEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order confirmed email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order confirmed email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderConfirmedSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order confirmed SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order confirmed SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order confirmed notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order confirmed notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderOnHoldNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderOnHoldEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order on hold email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order on hold email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderOnHoldSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order on hold SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order on hold SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order on hold notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order on hold notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderDeliveredNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderDeliveredEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order delivered email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order delivered email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderDeliveredSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order delivered SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order delivered SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order delivered notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order delivered notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderPaidNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderPaidEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order paid email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order paid email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderPaidSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order paid SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order paid SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order paid notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order paid notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderFailedNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderFailedEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order failed email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order failed email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderFailedSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order failed SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order failed SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order failed notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order failed notifications for order ${order.id}:`, error);
    }
  }

  async sendOrderPendingNotification(order: OrderEntity): Promise<void> {
    try {
      const contactInfo = this.getContactInfo(order);
      
      if (!contactInfo.hasEmail && !contactInfo.hasPhone) {
        this.logger.warn(`No contact information available for order ${order.id}`);
        return;
      }

      const promises: Promise<any>[] = [];

      if (contactInfo.hasEmail) {
        promises.push(
          this.mailService.sendOrderPendingEmail(order, contactInfo.email)
            .then(success => {
              if (success) {
                this.logger.log(`Order pending email sent successfully for order ${order.id} to ${contactInfo.email}`);
              } else {
                this.logger.error(`Failed to send order pending email for order ${order.id} to ${contactInfo.email}`);
              }
            })
        );
      }

      if (contactInfo.hasPhone) {
        const message = this.generateOrderPendingSmsMessage(order);
        promises.push(
          this.smsService.sendSms(contactInfo.phone, message)
            .then(success => {
              if (success) {
                this.logger.log(`Order pending SMS sent successfully for order ${order.id} to ${contactInfo.phone}`);
              } else {
                this.logger.error(`Failed to send order pending SMS for order ${order.id} to ${contactInfo.phone}`);
              }
            })
        );
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises);
        this.logger.log(`Order pending notifications processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error sending order pending notifications for order ${order.id}:`, error);
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
    
    this.logger.log(`Contact info for order ${order.id}: User email: ${userEmail || 'N/A'}, User phone: ${userPhone || 'N/A'}, Shipping email: ${shippingEmail || 'N/A'}, Shipping phone: ${shippingPhone || 'N/A'}, Final email: ${email || 'N/A'}, Final phone: ${phone || 'N/A'}`);
    
    return {
      email: email || '',
      phone: phone || '',
      hasEmail,
      hasPhone,
    };
  }

  private generateOrderPlacedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    // Calculate total using discount prices from cart items + delivery charge
    const productSubtotal = order.cart?.items?.reduce((sum, item) => {
      return sum + (parseFloat(item.product?.discountPrice.toString()) * item.quantity);
    }, 0) || 0;
    const total = productSubtotal + parseFloat(order.delivery_charge.toString());
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been placed successfully. Total: ৳${total.toFixed(2)}. Payment: ${paymentMethod}. - Gadget Nova`;
  }

  private generateOrderCancelledSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been cancelled. Payment was: ${paymentMethod}. Contact us for any questions. - Gadget Nova`;
  }

  private generateOrderShippedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been shipped and is on its way! Payment was: ${paymentMethod}. Track it in your dashboard. - Gadget Nova`;
  }

  private generateOrderOnHoldSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} is on hold. Payment was: ${paymentMethod}. We'll review and update you soon. - Gadget Nova`;
  }

  private generateOrderConfirmedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been confirmed and is being processed. Payment was: ${paymentMethod}. We'll ship it soon! - Gadget Nova`;
  }

  private generateOrderDeliveredSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} has been delivered successfully! Payment was: ${paymentMethod}. Thank you for choosing Gadget Nova! - Gadget Nova`;
  }

  private generateOrderPaidSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} payment has been received successfully! Payment method: ${paymentMethod}. Your order is now being processed. - Gadget Nova`;
  }

  private generateOrderFailedSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} payment has failed. Payment method was: ${paymentMethod}. Please contact us for assistance. - Gadget Nova`;
  }

  private generateOrderPendingSmsMessage(order: OrderEntity): string {
    const customerName = order.shippingInfo.first_name;
    const orderNumber = order.id;
    const paymentMethod = order.payments?.[0]?.paymentMethod || 'Cash on Delivery';
    
    return `Hi ${customerName}, your order #${orderNumber} is now pending. Payment method: ${paymentMethod}. We'll update you on the status soon. - Gadget Nova`;
  }
} 