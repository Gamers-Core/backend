import { Locale, TranslateFnWithoutLocale } from 'src/i18n';

import { MailType } from './types';
import { MAIL_DOMAIN } from './const';

export const getEmail = <T extends MailType>(mail: T) => `${mail}@${MAIL_DOMAIN}` as const;

export const renderMailWrapper = (t: TranslateFnWithoutLocale, content: string, locale: Locale = 'en') => {
  const isRtl = locale === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const align = isRtl ? 'right' : 'left';

  return `
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #111; text-align: ${align};"
  dir="${dir}" lang="${locale}">
  ${content}

  <hr style="margin: 20px 0;" />

  <p style="font-size: 12px; color: #888;">${t('mail.common.automatedEmail')}</p>
</div>
`;
};
