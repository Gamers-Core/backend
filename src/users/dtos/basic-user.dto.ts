import { Expose, Transform } from 'class-transformer';

import type { Locale } from 'src/i18n';

export class BasicUserDTO {
  @Expose()
  id: number;

  @Expose()
  name: string | null;

  @Expose()
  email: string;

  @Expose()
  locale: Locale;

  @Expose()
  @Transform(({ obj, options }) => {
    const userId = options.context?.userId;
    if (!userId) return false;

    return obj.id === userId;
  })
  isMe: boolean;
}
