import { MailTemplateFn } from '../types';

export const renderResetPasswordHtml: MailTemplateFn<'reset_password'> = (t, { otp }) =>
  `
  <h2 style="margin-bottom: 0;">🎮 Gamers Core</h2>
  <p style="margin-top: 4px; color: #555;">${t('mail.resetPassword.subject')}</p>

  <hr style="margin: 20px 0;" />

  <p>${t('mail.common.greeting')}</p>
  <p>${t('mail.resetPassword.body')}</p>

  <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; text-align: center; margin: 16px 0;">
    <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong>
  </div>
  `;
