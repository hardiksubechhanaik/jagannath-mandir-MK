import { useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { deepGet, interpolate } from './utils';
import en from './locales/en.js';
import or from './locales/or.js';
import hi from './locales/hi.js';

const DICTS = { en, or, hi };

export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  const api = useMemo(() => {
    function t(key, options = {}) {
      const { defaultValue, ...vars } = options;
      const object = options.object === true;

      let value = deepGet(DICTS[locale], key);
      if (value === undefined) value = deepGet(DICTS.en, key);
      if (value === undefined) return defaultValue ?? (object ? [] : key);

      if (object) return value;
      if (typeof value === 'string') return interpolate(value, vars);
      return value;
    }

    return { t, locale, setLocale };
  }, [locale, setLocale]);

  return api;
}
