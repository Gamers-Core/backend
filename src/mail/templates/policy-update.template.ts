import { MailTemplateFn } from '../types';

export const renderPolicyUpdateHtml: MailTemplateFn<'policy_update'> = (
  t,
  { policyType, version, updatedAt },
  { isRtl, frontendUrl },
) => {
  const locale = isRtl ? 'ar' : 'en';
  const formattedDate = new Date(updatedAt).toLocaleString(locale, { timeZone: 'Africa/Cairo' });

  return `
  <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
  <p style="margin-top: 4px; color: #555;">${t('mail.policyUpdate.header')}</p>
  <hr style="margin: 20px 0;" />

  <p>${t('mail.common.greeting')}</p>
  <p>${t('mail.policyUpdate.intro')}</p>

  <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
    <strong>${t('mail.policyUpdate.typeLabel')}</strong> ${t(`policies.type.${policyType}`)}<br />
    <strong>${t('mail.policyUpdate.versionLabel')}</strong> ${version}<br />
    <strong>${t('mail.policyUpdate.dateLabel')}</strong> ${formattedDate}
  </div>

  <p style="margin: 16px 0;">
    <a href="${frontendUrl}/policies/${policyType}"
      style="display: inline-block; background: #1a1a2e; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">
      ${t('mail.common.viewPolicy')}
    </a>
  </p>
  `;
};
