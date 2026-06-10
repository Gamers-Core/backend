import { MailTemplateFn } from '../types';

export const renderOrderNotifyAdminHtml: MailTemplateFn<'order_notify_admin'> = (
  t,
  order,
  { isRtl, adminFrontendUrl },
) => {
  const locale = isRtl ? 'ar-EG' : 'en-US';

  return `
  <h2 style="margin-bottom:0;">🎮 Gamers Core</h2>
  <p style="margin-top:4px;color:#555;">
    ${t('mail.notifyAdminNewOrder.header')}
  </p>

  <hr style="margin:20px 0;" />

  <p>${t('mail.notifyAdminNewOrder.intro')}</p>

  <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
    <strong>${t('mail.common.orderNumber')}</strong> ${order.orderNumber}<br />
    <strong>${t('mail.common.createdAt')}</strong>
      ${new Date(order.createdAt).toLocaleString(locale, {
        timeZone: 'Africa/Cairo',
      })}<br />
    <strong>${t('mail.common.paymentMethod')}</strong>
      ${order.paymentMethod}<br />
    <strong>${t('mail.common.status')}</strong>
      ${order.status}
  </div>

  <h3 style="margin-top:24px;">
    ${t('mail.notifyAdminNewOrder.customerInfo')}
  </h3>

  <div style="background:#f9f9f9;padding:16px;border-radius:8px;">
    <strong>${t('mail.common.customerName')}</strong>
      ${order.shippingAddress.nameAr}<br />
    <strong>${t('mail.common.phoneNumber')}</strong>
      ${order.shippingAddress.phoneNumber}<br />
    <strong>${t('mail.common.address')}</strong>
      ${order.shippingAddress.detailedAddress}<br />
    <strong>${t('mail.common.district')}</strong>
      ${order.shippingAddress.districtName}<br />
    <strong>${t('mail.common.city')}</strong>
      ${order.shippingAddress.cityName}
  </div>

  ${
    order.note
      ? `
  <h3 style="margin-top:24px;">
    ${t('mail.notifyAdminNewOrder.customerNote')}
  </h3>

  <div style="background:#fff8e1;padding:16px;border-radius:8px;">
    ${order.note}
  </div>
  `
      : ''
  }

  <h3 style="margin-top:24px;">
    ${t('mail.notifyAdminNewOrder.orderItems')}
  </h3>

  <table
    width="100%"
    cellspacing="0"
    cellpadding="8"
    style="border-collapse:collapse;"
  >
    <thead>
      <tr style="background:#eee;text-align:${isRtl ? 'right' : 'left'};">
        <th>${t('mail.common.item')}</th>
        <th>${t('mail.common.variant')}</th>
        <th>${t('mail.common.qty')}</th>
        <th>${t('mail.common.price')}</th>
        <th>${t('mail.common.total')}</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (item) => `
        <tr>
          <td>${item.productTitle}</td>
          <td>${item.variantName}</td>
          <td>${item.quantity}</td>
          <td>${order.currency}${item.unitPrice}</td>
          <td>${order.currency}${item.lineTotal}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <hr style="margin:20px 0;" />

  <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
    <strong>${t('mail.common.subtotal')}</strong>
      ${order.currency}${order.subtotal}<br />
    <strong>${t('mail.common.shippingFee')}</strong>
      ${order.currency}${order.shippingFee}<br />
    <strong>${t('mail.common.total')}</strong>
      ${order.currency}${order.total}<br />
    <strong>${t('mail.notifyAdminNewOrder.canOpenPackage')}</strong>
      ${order.canOpenPackage ? t('common.yes') : t('common.no')}
  </div>

  <p style="margin:16px 0;">
    <a
      href="${adminFrontendUrl}/orders/${order.orderNumber}"
      style="
        display:inline-block;
        background:#1a1a2e;
        color:#fff;
        padding:10px 18px;
        border-radius:6px;
        text-decoration:none;
      "
    >
      ${t('mail.notifyAdminNewOrder.viewOrder')}
    </a>
  </p>
  `;
};
