export const locales = ['en', 'es', 'it', 'fr', 'de', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
};

export const ogLocales: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_MX',
  it: 'it_IT',
  fr: 'fr_FR',
  de: 'de_DE',
  ja: 'ja_JP',
};
