import { Expose, Transform, Type } from 'class-transformer';

import { Localize } from 'src/i18n/decorators/localize.decorator';
import type { Localized } from 'src/i18n/types';

export class PolicyDTO {
  @Expose()
  @Localize()
  value: Localized;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  updatedAt: Date;
}

export class PoliciesDTO {
  @Expose()
  @Type(() => PolicyDTO)
  'terms-of-service': PolicyDTO;

  @Expose()
  @Type(() => PolicyDTO)
  shipping: PolicyDTO;

  @Expose()
  @Type(() => PolicyDTO)
  refund: PolicyDTO;

  @Expose()
  @Type(() => PolicyDTO)
  privacy: PolicyDTO;
}
