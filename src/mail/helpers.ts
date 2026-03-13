import { MailType } from './types';
import { MAIL_DOMAIN } from './const';

export const getEmail = <T extends MailType>(mail: T) =>
  `${mail}@${MAIL_DOMAIN}` as const;
