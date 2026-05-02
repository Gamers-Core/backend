import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import type { Localized } from 'src/i18n/types';
export class AddCategoryDTO {
  @IsLocalized()
  name: Localized;
}
