import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import enFallback from './en';
import nlFallback from './nl';
import omFallback from './om';

type Translations = typeof enFallback;
type Lang = 'en' | 'nl' | 'om';

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const fallbacks: Record<Lang, Translations> = {
  en: enFallback,
  nl: nlFallback,
  om: omFallback,
};

export const langLabels: Record<Lang, string> = {
  en: 'English',
  nl: 'Nederlands',
  om: 'Afaan Oromoo',
};

async function loadTranslation(lang: Lang): Promise<Translations> {
  try {
    const res = await fetch(`/content/${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallbacks[lang];
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [translations, setTranslations] = useState<Record<Lang, Translations>>(fallbacks);

  useEffect(() => {
    Promise.all(
      (['en', 'nl', 'om'] as Lang[]).map(async (l) => [l, await loadTranslation(l)] as const),
    ).then((entries) => {
      setTranslations(Object.fromEntries(entries) as Record<Lang, Translations>);
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
}
