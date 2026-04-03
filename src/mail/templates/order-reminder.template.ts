import { MailTemplateFn } from '../types';

export const renderOrderReminderHtml: MailTemplateFn<'order_reminder'> = (
  t,
  { orderNumber, items, currency, total },
  isRtl,
) =>
  `
  <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
  <p style="margin-top: 4px; color: #555;">${t('mail.orderReminder.header')}</p>

  <hr style="margin: 20px 0;" />

  <p>${t('mail.orderReminder.greetingAdmin')}</p>
  <p>${t('mail.orderReminder.detailsIntro')}</p>

  <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
    <strong>${t('mail.common.orderNumber')}</strong> ${orderNumber}<br />

    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse;">
      <thead>
        <tr style="background: #eee; text-align: ${isRtl ? 'right' : 'left'};">
          <th>${t('mail.common.item')}</th>
          <th>${t('mail.common.variant')}</th>
          <th>${t('mail.common.qty')}</th>
          <th>${t('mail.common.price')}</th>
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

    <strong>${t('mail.common.total')}</strong> ${currency}${total}
  </div>

  <hr style="margin: 20px 0;" />

  <a href="https://admin.gamers-core.net/orders/${orderNumber}"
    target="_blank">${t('mail.orderReminder.viewOrder')}</a>
  `;
