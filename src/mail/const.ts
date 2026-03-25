import { MailOptionsFn, MailOptionsType } from './types';

export const MAIL_DOMAIN = 'gamers-core.net';

export const mails = ['admin', 'contact', 'support', 'no-reply'] as const;

type MailOptionsMap = {
  [K in MailOptionsType]: MailOptionsFn<K>;
};

export const mailsOptions: MailOptionsMap = {
  reset_password: ({ otp }) => ({
    type: 'no-reply',
    title: 'Gamers Core Support',
    subject: 'Password Reset Code',
    html: `Your password reset code is: ${otp}`,
  }),
  signup: ({ otp }) => ({
    type: 'no-reply',
    title: 'Gamers Core Support',
    subject: 'Account Verification Code',
    html: `Your account verification code is: ${otp}`,
  }),
  order_confirmation: ({ orderNumber, total, currency, items }) => ({
    type: 'no-reply',
    title: 'Gamers Core Support',
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #111;">
    <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
    <p style="margin-top: 4px; color: #555;">Order Confirmation</p>

    <hr style="margin: 20px 0;" />

    <p>Hi there,</p>
    <p>Thanks for your order! Here’s your receipt:</p>

    <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
      <strong>Order #:</strong> ${orderNumber}<br/>
      <strong>Total:</strong> ${currency}${total}
    </div>

    <h3 style="margin-top: 20px;">Summary</h3>

    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse;">
      <thead>
        <tr style="background: #eee; text-align: left;">
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <!-- Inject items here -->
        ${items
          .map(
            (item) => `
          <tr>
            <td>${item.productTitle}</td>
            <td>${item.variantName}</td>
            <td>${item.quantity}</td>
            <td>${currency}${item.lineTotal}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>

    <hr style="margin: 20px 0;" />

    <p><strong>Total Paid:</strong> ${currency}${total}</p>

    <p style="color: #555;">We’ll notify you once your order is shipped.</p>

    <hr style="margin: 20px 0;" />

    <p style="font-size: 12px; color: #888;">
      Gamers Core • This is an automated email
    </p>
  </div>
  `,
  }),
  order_reminder: ({ orderNumber, items, currency, total }) => ({
    type: 'no-reply',
    title: 'Gamers Core Support',
    subject: 'New Order Placed',
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #111;">
    <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
    <p style="margin-top: 4px; color: #555;">New Order has been placed</p>

    <hr style="margin: 20px 0;" />

    <p>Hi Admin,</p>
    <p>A new order has been placed. Here are the details:</p>
    
    <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
      <strong>Order #:</strong> ${orderNumber}<br/>

      <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse;">
      <thead>
        <tr style="background: #eee; text-align: left;">
          <th>Item</th>
          <th>Variant</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <!-- Inject items here -->
        ${items
          .map(
            (item) => `
          <tr>
            <td>${item.productTitle}</td>
            <td>${item.variantName}</td>
            <td>${item.quantity}</td>
            <td>${currency}${item.lineTotal}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>

      <strong>Total:</strong> ${currency}${total}
    </div>

    <hr style="margin: 20px 0;" />
 
    <a href="https://admin.gamers-core.net/orders/${orderNumber}" target="_blank">View Order</a>
  </div>
`,
  }),
};
