import { defaultLocale } from 'src/i18n/const';
import { TranslateFnWithoutLocale, Locale } from 'src/i18n/types';

import { MAIL_DOMAIN } from './const';
import { MailType } from './types';

export const getEmail = <T extends MailType>(mail: T) => `${mail}@${MAIL_DOMAIN}` as const;

export const renderMailWrapper = (t: TranslateFnWithoutLocale, content: string, locale: Locale = defaultLocale) => {
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
