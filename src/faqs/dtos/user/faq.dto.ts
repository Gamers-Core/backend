import { Expose } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';

export class FAQDTO {
  @Expose()
  @Localize()
  question: string;

  @Expose()
  @Localize()
  answer: string;
}
