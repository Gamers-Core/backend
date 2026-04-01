import ar from './ar';
import en from './en';

import { Locale } from '../types';

export default { en, ar } satisfies Record<Locale, Record<string, string>>;
