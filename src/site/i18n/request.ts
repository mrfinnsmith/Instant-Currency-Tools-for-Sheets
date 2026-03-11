import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

import enMessages from './locales/en.json';
import esMessages from './locales/es.json';
import itMessages from './locales/it.json';
import frMessages from './locales/fr.json';
import deMessages from './locales/de.json';
import jaMessages from './locales/ja.json';

const messagesMap = {
  en: enMessages,
  es: esMessages,
  it: itMessages,
  fr: frMessages,
  de: deMessages,
  ja: jaMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }
  const messages = messagesMap[locale as keyof typeof messagesMap] || enMessages;
  return { locale, messages };
});
