import { MailTemplateFn } from '../types';

export const renderOrderConfirmationHtml: MailTemplateFn<'order_confirmation'> = (
  t,
  { orderNumber, currency, total, items },
  { isRtl, frontendUrl },
) =>
  `
  <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
  <p style="margin-top: 4px; color: #555;">${t('mail.orderConfirmation.header')}</p>

  <hr style="margin: 20px 0;" />

  <p>${t('mail.common.greeting')}</p>
  <p>${t('mail.orderConfirmation.thanksReceipt')}</p>

  <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
    <strong>${t('mail.common.orderNumber')}</strong> ${orderNumber}<br />
    <strong>${t('mail.common.total')}</strong> ${currency}${total}
  </div>

  <h3 style="margin-top: 20px;">${t('mail.orderConfirmation.summary')}</h3>

  <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse;">
    <thead>
      <tr style="background: #eee; text-align: ${isRtl ? 'right' : 'left'};">
        <th>${t('mail.common.item')}</th>
        <th>${t('mail.common.qty')}</th>
        <th>${t('mail.common.price')}</th>
        <th>${t('mail.common.total')}</th>
      </tr>
    </thead>
    <tbody>
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

  <p><strong>${t('mail.orderConfirmation.totalPaid')}</strong> ${currency}${total}</p>

  <p style="margin: 16px 0;">
    <a href="${frontendUrl}/orders/${orderNumber}"
      style="display: inline-block; background: #1a1a2e; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">
      ${t('mail.common.viewOrder')}
    </a>
  </p>

  <p style="color: #555;">${t('mail.orderConfirmation.thanksForYourOrder')}</p>
  `;
