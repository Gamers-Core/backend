import { IsLocalized, type Localized } from 'src/i18n';

export class AddBrandDTO {
  @IsLocalized()
  name: Localized;
}
