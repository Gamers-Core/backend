import { Expose, Type } from 'class-transformer';

import { Localize, type Localized } from 'src/i18n';

export class PolicyDTO {
  @Expose()
  @Localize()
  value: Localized;

  @Expose()
  createdAt: Date;
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
