import { ValidationError } from 'class-validator';

import { type Locale } from 'src/i18n';
import messages from 'src/i18n/messages';

const resolveConstraintMessage =
  (locale: Locale) =>
  ([key, message]: [string, string]): string => {
    const dictionary = messages[locale];

    if (dictionary[message]) return dictionary[message];
    if (dictionary[key]) return dictionary[key];

    return message;
  };

export const formatErrors = (errors: ValidationError[] | undefined, locale: Locale) => {
  if (!errors?.length) return [];

  return errors.map((error) => {
    const constraints = error.constraints ?? {};
    const entries = Object.entries(constraints);
    const keys = entries.map(([key]) => key);

    return {
      property: error.property,
      keys,
      messages: entries.map(resolveConstraintMessage(locale)),
      children: formatErrors(error.children, locale),
    };
  });
};
