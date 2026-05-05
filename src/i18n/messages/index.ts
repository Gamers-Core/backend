import type { Locale } from '../types';

import ar from './ar';
import en from './en';

export default { en, ar } satisfies Record<Locale, Record<string, string>>;
