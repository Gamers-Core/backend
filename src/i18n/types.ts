import messages from './messages';

import { locales } from './const';
import { translate } from './helpers';

export type Locale = (typeof locales)[number];
export type Messages = typeof messages;
export type TranslateFn = typeof translate;
export type TranslateFnWithoutLocale = <K extends I18nKey>(options: Translate<K>) => Messages[Locale][K];

export type EN = Messages['en'];
export type AR = Messages['ar'];

export type I18nKey = Extract<keyof EN, keyof AR>;
export type LanguageTranslations = EN | AR;

export type Translate<K extends I18nKey = I18nKey> = K extends I18nKey
  ? PlaceholderKeys<K> extends never
    ? [K] | K
    : [K, { [P in PlaceholderKeys<K>]: string | number }]
  : never;

type PlaceholderKeys<K extends I18nKey> = ExtractPlaceholders<Messages[Locale][K]>;
type ExtractPlaceholders<S extends string> = S extends `${string}{${infer K}}${infer Rest}`
  ? K | ExtractPlaceholders<Rest>
  : never;
