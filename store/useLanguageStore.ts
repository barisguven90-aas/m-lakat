import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from '../locales/en.json';
import tr from '../locales/tr.json';
import { createClient } from '@/lib/supabase/client';

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
      setLanguage: async (lang) => {
        set({ language: lang });
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000;`;
        
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ language: lang }).eq('id', user.id);
            }
        } catch (e) {
            console.error("Failed to sync language to profile", e);
        }
      },
    }),
    { name: 'intervio-language' }
  )
);
