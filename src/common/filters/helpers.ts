import { ValidationError } from 'class-validator';

import { I18nKey, Translate, translateWithoutLocale, type Locale } from 'src/i18n';

export const formatErrors = (errors: ValidationError[] | undefined, locale: Locale) => {
  if (!errors?.length) return [];

  return errors.map((error) => {
    const keys = Object.keys(error.constraints ?? {}) as Translate<I18nKey>[];

    return {
      property: error.property,
      keys,
      messages: keys.map(translateWithoutLocale(locale)),
      children: formatErrors(error.children, locale),
    };
  });
};
