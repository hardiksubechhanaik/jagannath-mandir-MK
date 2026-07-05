import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const LOCALES = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'or', label: 'ଓଡ଼ିଆ', native: 'Odia' },
  { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
];

const STORAGE_KEY = 'sjmmk-locale';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_KEY);
    return LOCALES.some((l) => l.code === saved) ? saved : 'en';
  });

  const setLocale = useCallback((code) => {
    if (!LOCALES.some((l) => l.code === code)) return;
    setLocaleState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'or' ? 'or' : locale === 'hi' ? 'hi' : 'en';
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
