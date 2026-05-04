import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '../locales/en.json';
import tr from '../locales/tr.json';

type Language = 'en' | 'tr';

interface LanguageState {
  language: Language;
  t: (key: keyof typeof en) => string;
  setLanguage: (lang: Language) => void;
}

const translations = { en, tr };

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      t: (key) => translations[get().language][key] || key,
      setLanguage: (lang) => {
        set({ language: lang });
        // Optional: Keep cookie sync for backend if needed
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000;`;
      },
    }),
    { name: 'intervio-language' }
  )
);
