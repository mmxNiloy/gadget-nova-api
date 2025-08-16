import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  context: OrderEmailContext | StatusChangeEmailContext;
}

export interface OrderEmailContext {
  customerName: string;
  orderNumber: number;
  orderDate: string;
  products: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  shipping: string;
  // shippingMethod: string;
  paymentMethod: string;
  total: string;
  couponCode?: string;
  couponDiscount?: string;
  billingAddress: {
    name: string;
    street: string;
    area: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    name: string;
    street: string;
    area: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface StatusChangeEmailContext {
  customerName: string;
  orderNumber: number;
  orderDate: string;
  products: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  shipping: string;
  paymentMethod: string;
  total: string;
  couponCode?: string;
  couponDiscount?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOrderPlacedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderPlacedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order placed email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order placed email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderCancelledEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderCancelledEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order cancelled email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order cancelled email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderOnProcessingEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderOnProcessingEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order on processing email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order on processing email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderShippedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderShippedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order shipped email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order shipped email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderConfirmedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderConfirmedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order confirmed email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmed email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderOnHoldEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderOnHoldEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order on hold email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order on hold email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderDeliveredEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderDeliveredEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order delivered email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order delivered email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderPaidEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderPaidEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order paid email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order paid email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderFailedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderFailedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order failed email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order failed email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  async sendOrderPendingEmail(
    order: OrderEntity,
    toEmail?: string,
  ): Promise<boolean> {
    try {
      const emailData = this.prepareOrderPendingEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(
        `Order pending email sent successfully for order ${order.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send order pending email for order ${order.orderId}:`,
        error,
      );
      return false;
    }
  }

  private prepareOrderPlacedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildOrderEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Confirmation - #${order.orderId}`,
      template: 'order-placed',
      context,
    };
  }

  private prepareOrderCancelledEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Cancelled - #${order.orderId}`,
      template: 'order-cancelled',
      context,
    };
  }

  private prepareOrderOnProcessingEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order On Processing - #${order.orderId}`,
      template: 'order-on-processing',
      context,
    };
  }

  private prepareOrderShippedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Shipped - #${order.orderId}`,
      template: 'order-shipped',
      context,
    };
  }

  private prepareOrderConfirmedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Confirmed - #${order.orderId}`,
      template: 'order-confirmed',
      context,
    };
  }

  private prepareOrderOnHoldEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order On Hold - #${order.orderId}`,
      template: 'order-on-hold',
      context,
    };
  }

  private prepareOrderDeliveredEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Delivered - #${order.orderId}`,
      template: 'order-delivered',
      context,
    };
  }

  private prepareOrderPaidEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Payment Received - #${order.orderId}`,
      template: 'order-paid',
      context,
    };
  }

  private prepareOrderFailedEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Payment Failed - #${order.orderId}`,
      template: 'order-failed',
      context,
    };
  }

  private prepareOrderPendingEmail(
    order: OrderEntity,
    toEmail?: string,
  ): EmailData {
    const context = this.buildStatusChangeEmailContext(order);

    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Pending - #${order.orderId}`,
      template: 'order-pending',
      context,
    };
  }

  private buildOrderEmailContext(order: OrderEntity): OrderEmailContext {
    // Debug logging
    console.log('Building email context for order:', {
      orderId: order.orderId,
      hasCart: !!order.cart,
      hasCartItems: !!order.cart?.items,
      cartItemsLength: order.cart?.items?.length,
      hasShippingInfo: !!order.shippingInfo,
      hasUser: !!order.user,
      couponCode: order.couponCode,
      couponDiscountValue: order.couponDiscountValue,
      orderTotalPrice: order.totalPrice,
    });

    const customerName = `${order.shippingInfo?.first_name || 'Customer'} ${order.shippingInfo?.last_name || ''}`;
    const orderDate = new Date(
      order.created_at || new Date(),
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Extract products from cart
    const products =
      order.cart?.items?.map((item) => ({
        name: item.product?.title || 'Product',
        quantity: item.quantity || 1,
        price: `৳${parseFloat((item.product?.discountPrice || 0).toString()).toFixed(2)}`,
      })) || [];

    // Calculate subtotal (products only, without shipping)
    const productSubtotal =
      order.cart?.items?.reduce((sum, item) => {
        return (
          sum +
          parseFloat(item.product?.discountPrice.toString()) * item.quantity
        );
      }, 0) || 0;

    const subtotal = `৳${productSubtotal.toFixed(2)}`;
    const shipping = `৳${parseFloat(order.delivery_charge.toString()).toFixed(2)}`;

    // Use the final total from order entity (which already includes coupon discount)
    const total = `৳${parseFloat(order.totalPrice.toString()).toFixed(2)}`;

    // Get payment method from the first payment
    const paymentMethod =
      order.payments?.[0]?.paymentMethod || 'Cash on Delivery';

    // Add coupon information if available
    const couponCode = order.couponCode || undefined;
    const couponDiscount = order.couponDiscountValue 
      ? `৳${parseFloat(order.couponDiscountValue.toString()).toFixed(2)}`
      : undefined;

    const addressParts = (order.shippingInfo?.address || '').split(',');
    const billingAddress = {
      name: customerName,
      street: addressParts[0] || '',
      area: addressParts[1] || '',
      city: order.shippingInfo?.district?.name || '',
      postalCode: 'XX', // Not available in current structure
      country: 'Bangladesh',
      phone: order.shippingInfo?.phone || '',
      email: order.shippingInfo?.email || '',
    };

    const shippingAddress = {
      name: customerName,
      street: addressParts[0] || '',
      area: addressParts[1] || '',
      city: order.shippingInfo?.district?.name || '',
      postalCode: 'XX', // Not available in current structure
      country: 'Bangladesh',
    };

    return {
      customerName,
      orderNumber: order.orderId,
      orderDate,
      products,
      subtotal,
      shipping,
      // shippingMethod: 'Fast Shipping',
      paymentMethod,
      total,
      couponCode,
      couponDiscount,
      billingAddress,
      shippingAddress,
    };
  }

  /**
   * Build simplified email context for status change emails (no cart data required)
   */
  private buildStatusChangeEmailContext(
    order: OrderEntity,
  ): StatusChangeEmailContext {
    // Debug logging
    console.log('Building status change email context for order:', {
      orderId: order.orderId,
      couponCode: order.couponCode,
      couponDiscountValue: order.couponDiscountValue,
      orderTotalPrice: order.totalPrice,
    });

    const customerName = `${order.shippingInfo?.first_name || 'Customer'} ${order.shippingInfo?.last_name || ''}`;
    const orderDate = new Date(
      order.created_at || new Date(),
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Extract products from cart for price breakdown
    const products =
      order.cart?.items?.map((item) => ({
        name: item.product?.title || 'Product',
        quantity: item.quantity || 1,
        price: `৳${parseFloat((item.product?.discountPrice || 0).toString()).toFixed(2)}`,
      })) || [];

    // Calculate subtotal (products only, without shipping)
    const productSubtotal =
      order.cart?.items?.reduce((sum, item) => {
        return (
          sum +
          parseFloat(item.product?.discountPrice.toString()) * item.quantity
        );
      }, 0) || 0;

    const subtotal = `৳${productSubtotal.toFixed(2)}`;
    const shipping = `৳${parseFloat(order.delivery_charge.toString()).toFixed(2)}`;

    // Use the final total from order entity (which already includes coupon discount)
    const total = `৳${parseFloat(order.totalPrice.toString()).toFixed(2)}`;

    // Get payment method from the first payment
    const paymentMethod =
      order.payments?.[0]?.paymentMethod || 'Cash on Delivery';

    // Add coupon information if available
    const couponCode = order.couponCode || undefined;
    const couponDiscount = order.couponDiscountValue 
      ? `৳${parseFloat(order.couponDiscountValue.toString()).toFixed(2)}`
      : undefined;

    return {
      customerName,
      orderNumber: order.orderId,
      orderDate,
      products,
      subtotal,
      shipping,
      paymentMethod,
      total,
      couponCode,
      couponDiscount,
    };
  }

  private async sendEmail(emailData: EmailData): Promise<void> {
    const { to, subject, template, context } = emailData;

    // For now, we'll use a simple HTML template
    // In production, you might want to use a template engine like Handlebars
    const htmlContent = this.generateEmailHtml(template, context);

    await this.mailerService.sendMail({
      to,
      subject,
      bcc: ['gadgetnova.bd@gmail.com'],
      html: htmlContent,
    });
  }

  private generateEmailHtml(
    template: string,
    context: OrderEmailContext | StatusChangeEmailContext,
  ): string {
    switch (template) {
      case 'order-placed':
        return this.generateOrderPlacedHtml(context as OrderEmailContext);
      case 'order-cancelled':
        return this.generateOrderCancelledHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-confirmed':
        return this.generateOrderConfirmedHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-shipped':
        return this.generateOrderShippedHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-on-hold':
        return this.generateOrderOnHoldHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-delivered':
        return this.generateOrderDeliveredHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-paid':
        return this.generateOrderPaidHtml(context as StatusChangeEmailContext);
      case 'order-failed':
        return this.generateOrderFailedHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-pending':
        return this.generateOrderPendingHtml(
          context as StatusChangeEmailContext,
        );
      case 'order-on-processing':
        return this.generateOrderOnProcessingHtml(
          context as StatusChangeEmailContext,
        );
      default:
        return this.generateOrderPlacedHtml(context as OrderEmailContext);
    }
  }

  /**
   * Helper function to generate coupon row HTML if coupon exists
   */
  private generateCouponRow(context: OrderEmailContext | StatusChangeEmailContext): string {
    console.log('Generating coupon row with context:', {
      couponCode: context.couponCode,
      couponDiscount: context.couponDiscount,
    });
    
    if (context.couponCode && context.couponDiscount) {
      return `
                <tr class="summary-row">
                  <td colspan="2">Coupon (${context.couponCode})</td>
                  <td>-${context.couponDiscount}</td>
                </tr>
      `;
    }
    return '';
  }

  private generateOrderPlacedHtml(context: OrderEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #ff6b35; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #ff6b35; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .address-section { margin-top: 30px; }
          .address h3 { color: #ff6b35; margin-bottom: 15px; }
          .address p { margin: 5px 0; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you for your order</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Just to let you know — we've received your order #${context.orderNumber}, and it is now being processed:</p>
            
            <p><strong>Payment Method: ${context.paymentMethod}</strong></p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <div class="address-section">
              <div class="address">
                <h3>Shipping Address</h3>
                <p>${context.shippingAddress.name}</p>
                <p>${context.shippingAddress.street}</p>
                <p>${context.shippingAddress.area}</p>
                <p>${context.shippingAddress.city}</p>
                <p>${context.shippingAddress.postalCode}</p>
                <p>${context.shippingAddress.country}</p>
                <p><a href="tel:${context.billingAddress.phone}" class="contact-info">${context.billingAddress.phone}</a></p>
                <p><a href="mailto:${context.billingAddress.email}" class="contact-info">${context.billingAddress.email}</a></p>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmedHtml(
    context: StatusChangeEmailContext,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Great news! Your order #${context.orderNumber} has been confirmed and is now being processed.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>We're preparing your order and will ship it soon. You'll receive another notification when your order is shipped.</p>
            
            <p>Thank you for choosing Gadget Nova!</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderCancelledHtml(
    context: StatusChangeEmailContext,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>We're sorry to inform you that your order #${context.orderNumber} has been cancelled.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>If you have any questions about this cancellation, please don't hesitate to contact our customer support team.</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderShippedHtml(context: StatusChangeEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Shipped</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Great news! Your order #${context.orderNumber} has been shipped and is on its way to you.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>You can track your order status through your account dashboard. We'll notify you once it's delivered.</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderOnHoldHtml(context: StatusChangeEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order On Hold</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order On Hold</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Your order #${context.orderNumber} has been placed on hold. We'll review it and get back to you soon.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>If you have any questions about this hold, please don't hesitate to contact our customer support team.</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderDeliveredHtml(
    context: StatusChangeEmailContext,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Delivered</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Great news! Your order #${context.orderNumber} has been delivered successfully.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>Thank you for choosing Gadget Nova! We hope you enjoy your purchase.</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderPaidHtml(context: StatusChangeEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Payment Received</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Payment Received</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Great news! Your payment for order #${context.orderNumber} has been received successfully.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>Your order is now being processed and will be shipped soon!</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderFailedHtml(context: StatusChangeEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Payment Failed</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Payment Failed</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>We're sorry, but the payment for your order #${context.orderNumber} has failed.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>Please contact our customer support team for assistance with your payment.</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderPendingHtml(context: StatusChangeEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Pending</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Pending</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Your order #${context.orderNumber} is now pending. We'll update you on the status soon.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>We're processing your order and will keep you updated on any status changes.</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderOnProcessingHtml(context: StatusChangeEmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order On Processing</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #F92903; color: white; padding: 30px 20px; text-align: left; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; }
          .order-info { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .order-info h2 { color: #F92903; margin: 0 0 10px 0; font-size: 18px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th, .order-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .order-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary-row { background-color: #f8f9fa; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order On Processing</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${context.customerName},</div>
            
            <p>Great news! Your order #${context.orderNumber} is now being processed by our team.</p>
            
            <div class="order-info">
              <h2>[Order #${context.orderNumber}] (${context.orderDate})</h2>
            </div>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${context.products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `,
                  )
                  .join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
                ${this.generateCouponRow(context)}
<tr class="summary-row">
                  <td colspan="2">Payment method</td>
                  <td>${context.paymentMethod}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>${context.total}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p>Our team is carefully preparing your order and will ship it soon. You'll receive another notification when your order is shipped.</p>
            
            <p>Thank you for choosing Gadget Nova!</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test method for sending a simple email
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Test Email from Gadget Nova',
        html: '<h1>This is a test email</h1><p>If you received this, the email service is working correctly!</p>',
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to send test email:', error);
      return false;
    }
  }

  async sendCouponEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: htmlContent,
        bcc: ['gadgetnova.bd@gmail.com'],
      });
      this.logger.log(`Coupon email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send coupon email to ${to}:`, error);
      return false;
    }
  }

  async sendWishlistNotificationEmail(
    to: string,
    productSlug: string,
    productTitle: string,
  ): Promise<boolean> {
    try {
      const subject = '🎉 Your Wishlisted Product is Now Available!';
      const htmlContent = this.generateWishlistNotificationHtml(productSlug, productTitle);
      
      await this.mailerService.sendMail({
        to,
        subject,
        html: htmlContent,
        bcc: ['gadgetnova.bd@gmail.com'],
      });
      
      this.logger.log(`Wishlist notification email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send wishlist notification email to ${to}:`, error);
      return false;
    }
  }

  private generateWishlistNotificationHtml(productSlug: string, productTitle: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Available - Gadget Nova</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9f9f9; }
          .header { background-color: #F92903; color: white; text-align: center; padding: 30px 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; background-color: white; margin: 20px; border-radius: 8px; }
          .greeting { font-size: 18px; margin-bottom: 20px; color: #F92903; font-weight: bold; }
          .product-info { background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F92903; }
          .product-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #F92903; }
          .cta-button { display: inline-block; background-color: #F92903; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .cta-button:hover { background-color: #d42400; }
          .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #666; }
          .contact-info { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Gadget Nova</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Hello!</div>
            
            <p>Good news! The product you wishlisted is now available with a special offer.</p>
            
            <div class="product-info">
              <div class="product-title">${productTitle}</div>
              <p>Don't miss out on this amazing opportunity!</p>
            </div>
            
            <p>Click the button below to check it out:</p>
            
            <a href="https://gadgetnovabd.com/products/${productSlug}" class="cta-button">
              View Product Now
            </a>
            
            <p>Thank you for being a valued member of our community!</p>
          </div>
          
          <div class="footer">
            <p>Thanks for using gadgetnovabd.com!</p>
            <p><a href="https://gadgetnovabd.com" class="contact-info">gadgetnovabd.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
