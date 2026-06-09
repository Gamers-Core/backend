import { Expose } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, ValidateIf } from 'class-validator';

import { defaultLocale } from 'src/i18n/const';
import { IsLocalized } from 'src/i18n/decorators/is-localized.decorator';
import { translate } from 'src/i18n/helpers';
import type { Locale, Localized } from 'src/i18n/types';

const t = (Locale: Locale = defaultLocale) => translate('settings.maintenanceMode.message', Locale);

export class MaintenanceModeSettingDTO {
  @Expose()
  @IsBoolean()
  enabled: boolean;

  @Expose()
  @ValidateIf((o) => o.enabled === true)
  @IsOptional()
  @IsLocalized()
  message: Localized = {
    [defaultLocale]: t(),
    ar: t('ar'),
  };

  @Expose()
  @ValidateIf((o) => o.enabled === true)
  @IsOptional()
  @IsDateString()
  countdown?: Date;
}
