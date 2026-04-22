import { IsLocalized, type Localized } from 'src/i18n';

export class UpdatePolicyDTO {
  @IsLocalized()
  value: Localized;
}
