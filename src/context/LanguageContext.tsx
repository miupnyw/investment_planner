"use client";

import { createContext, useContext, useState } from "react";
import translations from "@/locales/translations.json";

// Define the supported languages as a union type
export type Language = "en" | "th";

// Define the shape of the language context value
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the language context with a null default value
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize the language state with a default value of "en"
  const [language, setLanguage] = useState<Language>("en");

  // Define the translation function that looks up the key in the translations object
  function t(key: string): string {
    const entry = (translations as Record<string, Record<Language, string>>)[
      key
    ];
    return entry?.[language] ?? key;
  }

  return (
    // Provide the language, setLanguage function, and translation function to the context consumers
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to consume the language context
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
