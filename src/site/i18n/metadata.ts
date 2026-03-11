import type { Locale } from './config';

import enMessages from './locales/en.json';
import esMessages from './locales/es.json';
import itMessages from './locales/it.json';
import frMessages from './locales/fr.json';
import deMessages from './locales/de.json';
import jaMessages from './locales/ja.json';

const messagesMap: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
  it: itMessages,
  fr: frMessages,
  de: deMessages,
  ja: jaMessages,
};

export function getMetadata(locale: Locale) {
  const messages = messagesMap[locale] || enMessages;
  return messages.metadata;
}
