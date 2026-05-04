"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";

export function LanguageToggle() {
    const { language, setLanguage } = useLanguageStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleLang = () => {
        const next = language === 'en' ? 'tr' : 'en';
        setLanguage(next);
        
        // Setup Google Translate cookie fallbacks just in case
        if (next === 'tr') {
            document.cookie = "googtrans=/en/tr; path=/;";
            document.cookie = "googtrans=/auto/tr; path=/;";
        } else {
            // Restore English
            document.cookie = "googtrans=/en/en; path=/;";
            document.cookie = "googtrans=/auto/en; path=/;";
        }
        
        // Trigger Google Translate drop-down if present (legacy support)
        const translateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (translateCombo) {
            translateCombo.value = next === 'tr' ? 'tr' : 'en';
            translateCombo.dispatchEvent(new Event('change'));
        }
    };

    if (!mounted) {
        return <div className="h-8 w-12" />; // placeholder
    }

    return (
        <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 h-8 px-2 md:px-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 uppercase"
            aria-label="Toggle language"
        >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{language === 'en' ? 'EN' : 'TR'}</span>
            <span className="md:hidden text-[10px]">{language === 'en' ? 'GB' : 'TR'}</span>
        </button>
    );
}
