// Import modular translations
import { en, es, fr, de, ja, zh, type Translations } from './translations';

// Export the Translations type for use in other files
export type { Translations };

// Aggregate all translations in a single object
export const translations: Record<string, Translations> = {
  en,
  es,
  fr,
  de,
  ja,
  zh,
};

export function getSystemLanguage(): string {
  if (typeof window === 'undefined') return 'en';

  // Get language from browser
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';

  // Extract the language code (e.g., 'en-US' -> 'en')
  const langCode = browserLang.split('-')[0];

  // Check if we support this language
  if (translations[langCode]) {
    return langCode;
  }

  // Fallback to English
  return 'en';
}

export function getSupportedLanguages() {
  return Object.keys(translations);
}

export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    zh: '中文',
  };
  return names[code] || code;
}
