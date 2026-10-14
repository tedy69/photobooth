"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { translations, getSystemLanguage, type Translations } from "@/lib/i18n";
import { studioCopy, type StudioCopy } from "@/lib/studio-copy";
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
  copy: StudioCopy;
}
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("en");
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("photobooth-language");
    } catch {
      /* Browser storage is optional for language preferences. */
    }
    const next = saved && translations[saved] ? saved : getSystemLanguage();
    const timer = setTimeout(() => setLanguageState(next), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const setLanguage = (lang: string) => {
    if (!translations[lang]) return;
    setLanguageState(lang);
    try {
      localStorage.setItem("photobooth-language", lang);
    } catch {
      /* Keep the session preference when persistence is blocked. */
    }
  };
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        copy: studioCopy[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
