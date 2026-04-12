import { IsLocalized, type Localized } from 'src/i18n';

export class AddCategoryDTO {
  @IsLocalized()
  name: Localized;
}
