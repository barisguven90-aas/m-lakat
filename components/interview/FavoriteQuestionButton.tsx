"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export function FavoriteQuestionButton({ question, answer }: { question: string; answer: string }) {
    const [favorited, setFavorited] = useState(false);

    const toggleFavorite = () => {
        setFavorited(!favorited);
        // Save to localStorage
        const key = 'intervio_favorite_questions';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (!favorited) {
            existing.push({ question, answer, savedAt: new Date().toISOString() });
            localStorage.setItem(key, JSON.stringify(existing));
        } else {
            const filtered = existing.filter((q: any) => q.question !== question);
            localStorage.setItem(key, JSON.stringify(filtered));
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            className={`p-1.5 rounded-lg transition-all ${favorited
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'text-slate-400 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            title={favorited ? "Remove from favorites" : "Save to favorites"}
        >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
        </button>
    );
}
