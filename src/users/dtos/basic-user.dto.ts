import { Expose, Transform } from 'class-transformer';

import type { Locale } from 'src/i18n';

type TransformContext = {
  context?: {
    userId?: number;
  };
};

export class BasicUserDTO {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  locale: Locale;

  @Expose()
  @Transform(({ obj, options }) => {
    const userId = (options as TransformContext | undefined)?.context?.userId;
    if (!userId) return false;

    return obj.id === userId;
  })
  isMe: boolean;
}
