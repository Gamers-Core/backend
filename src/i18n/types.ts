import messages from './messages';

import { locales } from './index';

export type Locale = (typeof locales)[number];
export type Messages = typeof messages;

export type EN = Messages['en'];
export type AR = Messages['ar'];

export type I18nKey = Extract<keyof EN, keyof AR>;
export type LanguageTranslations = EN | AR;

export type Translate<K extends I18nKey = I18nKey> =
  PlaceholderKeys<K> extends never ? [K] : [K, { [P in PlaceholderKeys<K>]: string | number }];

type PlaceholderKeys<K extends I18nKey> = ExtractPlaceholders<Messages[Locale][K]>;
type ExtractPlaceholders<S extends string> = S extends `${string}{${infer K}}${infer Rest}`
  ? K | ExtractPlaceholders<Rest>
  : never;
