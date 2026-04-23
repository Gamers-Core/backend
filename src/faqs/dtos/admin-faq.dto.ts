import { Expose } from 'class-transformer';

import { type Localized } from 'src/i18n';

export class AdminFAQDTO {
  @Expose()
  id: number;

  @Expose()
  question: Localized;

  @Expose()
  answer: Localized;

  @Expose()
  position: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
