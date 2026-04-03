import { Transform } from 'class-transformer';

import { isLocalized, localize } from '../helpers';

export const Localize = () =>
  Transform(({ value, options }) => {
    if (!isLocalized(value)) return value;

    return localize(value, options.context?.locale);
  });
