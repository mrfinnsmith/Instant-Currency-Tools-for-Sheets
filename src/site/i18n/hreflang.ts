import { locales } from './config';

const BASE_URL = 'https://instantcurrency.tools';

export function getLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }

  languages['x-default'] = `${BASE_URL}/en${path}`;
  return languages;
}
