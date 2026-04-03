/* eslint-disable @typescript-eslint/no-unused-vars */
import { AR, EN } from './types';

type TranslateEn = keyof EN;
type TranslateAr = keyof AR;

type EnDiff = Exclude<TranslateEn, TranslateAr>;
type ArDiff = Exclude<TranslateAr, TranslateEn>;

type AssertNever<T extends never> = T;

type _AssertEnDiff = AssertNever<EnDiff>;
type _AssertArDiff = AssertNever<ArDiff>;
