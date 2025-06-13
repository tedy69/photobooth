'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, getSystemLanguage, type Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize language from localStorage or system default
    const savedLanguage = localStorage.getItem('photobooth-language');
    const systemLanguage = getSystemLanguage();
    const initialLanguage = savedLanguage || systemLanguage;

    setLanguageState(initialLanguage);
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('photobooth-language', lang);
  };

  // Don't render until initialized to prevent hydration issues
  if (!isInitialized) {
    return null;
  }

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
