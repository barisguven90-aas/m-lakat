"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Linkedin, Twitter } from "lucide-react";
import { toast } from "sonner";

import { useLanguageStore } from "@/store/useLanguageStore";

interface ShareCardProps {
    hireProbability: number;
    jobTitle?: string;
    company?: string;
    level?: string;
    questionsCount?: number;
}

export function ShareCard({ hireProbability, jobTitle, company, level, questionsCount }: ShareCardProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const { language, t } = useLanguageStore();

    const shareText = language === 'tr' 
        ? `IntervioAI ile mülakat hazırlığımı test ettim. İşe Alım Olasılığım: %${hireProbability}.` 
        : `I just tested my interview readiness with AI on IntervioAI. My hire probability was ${hireProbability}%.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLinkedIn = () => {
        const url = encodeURIComponent('https://intervioai.com');
        const text = encodeURIComponent(shareText);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
    };

    const handleTwitter = () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
                <Share2 className="h-4 w-4 mr-2" />
                {language === 'tr' ? 'Paylaş' : 'Share'}
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-xs h-8"
            >
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? (language === 'tr' ? 'Kopyalandı' : 'Copied') : (language === 'tr' ? 'Kopyala' : 'Copy')}
            </Button>
            <Button
                onClick={handleLinkedIn}
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-xs h-8"
            >
                <Linkedin className="h-3.5 w-3.5 mr-1" />
                LinkedIn
            </Button>
            <Button
                onClick={handleTwitter}
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-xs h-8"
            >
                <Twitter className="h-3.5 w-3.5 mr-1" />
                {language === 'tr' ? 'X\'te Paylaş' : 'Share on X'}
            </Button>
        </div>
    );
}
