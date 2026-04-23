import { IsLocalized, type Localized } from 'src/i18n';

export class AddFAQDTO {
  @IsLocalized()
  question: Localized;

  @IsLocalized()
  answer: Localized;
}
