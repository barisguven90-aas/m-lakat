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
            <span translate="no" className="notranslate hidden md:inline">{language === 'en' ? 'EN' : 'TR'}</span>
            <span translate="no" className="notranslate md:hidden text-[10px]">{language === 'en' ? 'EN' : 'TR'}</span>
        </button>
    );
}
