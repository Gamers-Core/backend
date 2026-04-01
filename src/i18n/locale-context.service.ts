import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';

import { defaultLocale } from './const';
import type { Locale } from './types';

export interface LocaleContextStore {
  headerLocale?: Locale;
  currentUserLocale?: Locale;
  locale: Locale;
}

@Injectable()
export class LocaleContextService {
  private readonly storage = new AsyncLocalStorage<LocaleContextStore>();

  run<T>({ locale, ...rest }: Partial<LocaleContextStore>, callback: () => T): T {
    return this.storage.run({ ...rest, locale: locale ?? defaultLocale }, callback);
  }

  get locale(): Locale {
    return this.storage.getStore()?.locale ?? defaultLocale;
  }

  get store(): LocaleContextStore | undefined {
    return this.storage.getStore();
  }

  setCurrentUserLocale(locale: Locale) {
    const store = this.storage.getStore();
    if (!store) return;

    store.currentUserLocale = locale;

    if (!store.headerLocale) store.locale = locale;
  }
}
