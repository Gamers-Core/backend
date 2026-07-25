import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

import { defaultLocale } from './const';
import type { Locale } from './types';

export interface LocaleContextStore {
  locale: Locale;
}

@Injectable()
export class LocaleContextService {
  private readonly storage = new AsyncLocalStorage<LocaleContextStore>();

  run<T>(callback: () => T, locale: Locale = defaultLocale): T {
    return this.storage.run({ locale }, callback);
  }

  get locale(): Locale {
    return this.storage.getStore()?.locale ?? defaultLocale;
  }

  set locale(locale: Locale) {
    const store = this.storage.getStore();
    if (!store) return;

    store.locale = locale;
  }
}
