import { Expose, Transform, Type } from 'class-transformer';

import { type PolicyType } from 'src/entity';
import { type Localized } from 'src/i18n';

export class AdminPolicyDTO {
  @Expose()
  id: number;

  @Expose()
  type: PolicyType;

  @Expose()
  value: Localized;

  @Expose()
  version: number;

  @Expose()
  @Transform(({ obj }) => obj.createdAt)
  updatedAt: Date;
}

export class AdminPoliciesDTO {
  @Expose()
  @Type(() => AdminPolicyDTO)
  'terms-of-service': AdminPolicyDTO;

  @Expose()
  @Type(() => AdminPolicyDTO)
  shipping: AdminPolicyDTO;

  @Expose()
  @Type(() => AdminPolicyDTO)
  refund: AdminPolicyDTO;

  @Expose()
  @Type(() => AdminPolicyDTO)
  privacy: AdminPolicyDTO;
}
