import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  context: any;
}

export interface OrderEmailContext {
  customerName: string;
  orderNumber: string;
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
  orderNumber: string;
  orderDate: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOrderPlacedEmail(order: OrderEntity, toEmail?: string): Promise<boolean> {
    try {
      const emailData = this.prepareOrderPlacedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(`Order placed email sent successfully for order ${order.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order placed email for order ${order.id}:`, error);
      return false;
    }
  }

  async sendOrderCancelledEmail(order: OrderEntity, toEmail?: string): Promise<boolean> {
    try {
      const emailData = this.prepareOrderCancelledEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(`Order cancelled email sent successfully for order ${order.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order cancelled email for order ${order.id}:`, error);
      return false;
    }
  }

  async sendOrderShippedEmail(order: OrderEntity, toEmail?: string): Promise<boolean> {
    try {
      const emailData = this.prepareOrderShippedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(`Order shipped email sent successfully for order ${order.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order shipped email for order ${order.id}:`, error);
      return false;
    }
  }

  async sendOrderConfirmedEmail(order: OrderEntity, toEmail?: string): Promise<boolean> {
    try {
      const emailData = this.prepareOrderConfirmedEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(`Order confirmed email sent successfully for order ${order.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order confirmed email for order ${order.id}:`, error);
      return false;
    }
  }

  async sendOrderOnHoldEmail(order: OrderEntity, toEmail?: string): Promise<boolean> {
    try {
      const emailData = this.prepareOrderOnHoldEmail(order, toEmail);
      await this.sendEmail(emailData);
      this.logger.log(`Order on hold email sent successfully for order ${order.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order on hold email for order ${order.id}:`, error);
      return false;
    }
  }

  private prepareOrderPlacedEmail(order: OrderEntity, toEmail?: string): EmailData {
    const context = this.buildOrderEmailContext(order);
    
    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Confirmation - #${order.id}`,
      template: 'order-placed',
      context,
    };
  }

  private prepareOrderCancelledEmail(order: OrderEntity, toEmail?: string): EmailData {
    const context = this.buildStatusChangeEmailContext(order);
    
    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Cancelled - #${order.id}`,
      template: 'order-cancelled',
      context,
    };
  }

  private prepareOrderShippedEmail(order: OrderEntity, toEmail?: string): EmailData {
    const context = this.buildStatusChangeEmailContext(order);
    
    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Shipped - #${order.id}`,
      template: 'order-shipped',
      context,
    };
  }

  private prepareOrderConfirmedEmail(order: OrderEntity, toEmail?: string): EmailData {
    const context = this.buildStatusChangeEmailContext(order);
    
    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order Confirmed - #${order.id}`,
      template: 'order-confirmed',
      context,
    };
  }

  private prepareOrderOnHoldEmail(order: OrderEntity, toEmail?: string): EmailData {
    const context = this.buildStatusChangeEmailContext(order);
    
    return {
      to: toEmail || order.shippingInfo.email,
      subject: `Order On Hold - #${order.id}`,
      template: 'order-on-hold',
      context,
    };
  }

  private buildOrderEmailContext(order: OrderEntity): OrderEmailContext {
    // Debug logging
    console.log('Building email context for order:', {
      orderId: order.id,
      hasCart: !!order.cart,
      hasCartItems: !!order.cart?.items,
      cartItemsLength: order.cart?.items?.length,
      hasShippingInfo: !!order.shippingInfo,
      hasUser: !!order.user
    });

    const customerName = `${order.shippingInfo?.first_name || 'Customer'} ${order.shippingInfo?.last_name || ''}`;
    const orderDate = new Date(order.created_at || new Date()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Extract products from cart
    const products = order.cart?.items?.map(item => ({
      name: item.product?.title || 'Product',
      quantity: item.quantity || 1,
      price: `৳${parseFloat((item.price || 0).toString()).toFixed(2)}`,
    })) || [];

    const subtotal = `৳${parseFloat(order.totalPrice.toString()).toFixed(2)}`;
    const shipping = `৳${parseFloat(order.delivery_charge.toString()).toFixed(2)}`;
    const total = `৳${(parseFloat(order.totalPrice.toString()) + parseFloat(order.delivery_charge.toString())).toFixed(2)}`;

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
      orderNumber: order.id,
      orderDate,
      products,
      subtotal,
      shipping,
      // shippingMethod: 'Fast Shipping',
      paymentMethod: 'Cash on delivery',
      total,
      billingAddress,
      shippingAddress,
    };
  }

  /**
   * Build simplified email context for status change emails (no cart data required)
   */
  private buildStatusChangeEmailContext(order: OrderEntity): StatusChangeEmailContext {
    const customerName = `${order.shippingInfo?.first_name || 'Customer'} ${order.shippingInfo?.last_name || ''}`;
    const orderDate = new Date(order.created_at || new Date()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      customerName,
      orderNumber: order.id,
      orderDate,
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
      html: htmlContent,
    });
  }

  private generateEmailHtml(template: string, context: OrderEmailContext): string {
    switch (template) {
      case 'order-placed':
        return this.generateOrderPlacedHtml(context);
      case 'order-cancelled':
        return this.generateOrderCancelledHtml(context);
      case 'order-confirmed':
        return this.generateOrderConfirmedHtml(context);
      case 'order-shipped':
        return this.generateOrderShippedHtml(context);
      case 'order-on-hold':
        return this.generateOrderOnHoldHtml(context);
      default:
        return this.generateOrderPlacedHtml(context);
    }
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
            
            <p><strong>Pay with cash upon delivery.</strong></p>
            
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
                ${context.products.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price}</td>
                  </tr>
                `).join('')}
                <tr class="summary-row">
                  <td colspan="2">Subtotal</td>
                  <td>${context.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2">Shipping</td>
                  <td>${context.shipping}</td>
                </tr>
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

  private generateOrderConfirmedHtml(context: StatusChangeEmailContext): string {
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

  private generateOrderCancelledHtml(context: StatusChangeEmailContext): string {
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

  // Test method for sending a simple email
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      to = "sadikuzzaman1996@gmail.com"
      await this.mailerService.sendMail({
        to,
        subject: 'Test Email from Gadget Nova',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email to verify the mail service is working correctly.</p>
          <p>Sent from Gadget Nova Mail Service</p>
        `,
      });
      this.logger.log('Test email sent successfully');
      return true;
    } catch (error) {
      console.log(error);
      
      this.logger.error('Failed to send test email:', error);
      return false;
    }
  }
} 