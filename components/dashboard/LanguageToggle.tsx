"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageToggle() {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = document.cookie.split('; ').find(row => row.startsWith('NEXT_LOCALE='));
        if (stored) {
            setLang(stored.split('=')[1]);
        }
    }, []);

    const toggleLang = () => {
        const next = lang === 'en' ? 'tr' : 'en';
        setLang(next);
        
        // Keep NEXT_LOCALE for internal logical checks
        document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000;`;
        
        // Setup Google Translate cookie fallbacks
        if (next === 'tr') {
            document.cookie = "googtrans=/en/tr; path=/;";
            document.cookie = "googtrans=/auto/tr; path=/;";
        } else {
            // Restore English
            document.cookie = "googtrans=/en/en; path=/;";
            document.cookie = "googtrans=/auto/en; path=/;";
        }
        
        // Programmatically trigger the Google Translate dropdown to translate in real-time
        const translateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (translateCombo) {
            translateCombo.value = next === 'tr' ? 'tr' : 'en';
            translateCombo.dispatchEvent(new Event('change'));
        } else {
            // If the script hasn't loaded yet, fallback to hard reload which grabs the cookie
            window.location.reload();
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
            <span className="hidden md:inline">{lang === 'en' ? 'EN' : 'TR'}</span>
            <span className="md:hidden text-[10px]">{lang === 'en' ? 'GB' : 'TR'}</span>
        </button>
    );
}
