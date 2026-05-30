import { MailTemplateFn } from '../types';

export const renderOrderStatusUpdateHtml: MailTemplateFn<'order_status_update'> = (
  t,
  { orderNumber, status, currency, total, items },
  { isRtl, frontendUrl },
) =>
  `
  <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
  <p style="margin-top: 4px; color: #555;">${t('mail.orderStatusUpdate.header')}</p>
  <hr style="margin: 20px 0;" />

  <p>${t('mail.common.greeting')}</p>
  <p>${t('mail.orderStatusUpdate.intro')}</p>

  <div style="
    display: inline-block;
    background: #1a1a2e;
    color: #fff;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    margin: 12px 0 20px;
    letter-spacing: 0.5px;
  ">
    ${t(`orders.status.${status}`)}
  </div>

  <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
    <strong>${t('mail.common.orderNumber')}</strong> ${orderNumber}<br />
    <strong>${t('mail.common.total')}</strong> ${currency}${total}
  </div>

  <details>
    <summary style="cursor: pointer; color: #555; font-size: 14px; margin-bottom: 8px;">
      ${t('mail.orderStatusUpdate.summary')} (${items.length})
    </summary>
    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse; margin-top: 8px;">
      <thead>
        <tr style="background: #eee; text-align: ${isRtl ? 'right' : 'left'}; font-size: 13px;">
          <th>${t('mail.common.item')}</th>
          <th>${t('mail.common.variant')}</th>
          <th>${t('mail.common.qty')}</th>
          <th>${t('mail.common.total')}</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
        <tr style="border-bottom: 1px solid #eee; font-size: 13px;">
          <td>${item.productTitle}</td>
          <td style="color: #777;">${item.variantName}</td>
          <td>${item.quantity}</td>
          <td>${currency}${item.lineTotal}</td>
        </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </details>

  <p style="margin: 16px 0;">
    <a href="${frontendUrl}/orders/${orderNumber}"
      style="display: inline-block; background: #1a1a2e; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">
      ${t('mail.common.viewOrder')}
    </a>
  </p>

  <hr style="margin: 20px 0;" />
  <p style="color: #555; font-size: 13px;">${t('mail.orderStatusUpdate.notice')}</p>
  `;
