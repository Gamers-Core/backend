import { MailTemplateFn } from '../types';

export const renderSigninHtml: MailTemplateFn<'signin' | 'admin_signin'> = (t, { otp }, { isRtl }) =>
  `
  <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
  <p style="margin-top: 4px; color: #555;">${t('mail.signin.header')}</p>
  <hr style="margin: 20px 0;" />

  <p>${t('mail.common.greeting')}</p>
  <p>${t('mail.signin.body')}</p>

  <div style="
    background: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    margin: 16px 0;
    direction: ${isRtl ? 'rtl' : 'ltr'};
  ">
    <strong style="font-size: 28px; letter-spacing: 6px;">${otp}</strong>
  </div>

  <p style="color: #555; font-size: 13px;">${t('mail.signin.expiryNotice')}</p>
  <p style="color: #999; font-size: 12px;">${t('mail.signin.securityNotice')}</p>
  `;
