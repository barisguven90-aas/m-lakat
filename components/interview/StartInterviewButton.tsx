"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Loader2, User, Code, Globe, Languages, Rocket, Building2, Briefcase, Building, ChevronRight, Sparkles, Mic } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProComingSoonModal } from "../dashboard/ProComingSoonModal";

// Helper to get cookie
const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

interface StartInterviewButtonProps {
    applicationId: string;
    variant?: "default" | "outline" | "ghost";
    className?: string;
}

const INTERVIEW_TYPES = [
    {
        id: 'hr_behavioral',
        label: 'Behavioral (HR)',
        labelTr: 'Davranışsal (İK)',
        desc: 'STAR method, soft skills, cultural fit',
        descTr: 'STAR yöntemi, davranışsal sorular, kişilik uyumu',
        icon: User,
        color: 'text-blue-500',
        badge: 'Most Common'
    },
    {
        id: 'technical',
        label: 'Technical',
        labelTr: 'Teknik',
        desc: 'System design, problem-solving, hard skills',
        descTr: 'Sistem tasarımı, problem çözme, teknik beceriler',
        icon: Code,
        color: 'text-purple-500',
        badge: null
    },
    {
        id: 'language',
        label: 'Language Proficiency',
        labelTr: 'Dil Yeterliliği',
        desc: 'Fluency, vocabulary, grammar, communication',
        descTr: 'Akıcılık, kelime hazinesi, dilbilgisi',
        icon: Globe,
        color: 'text-green-500',
        badge: 'New'
    }
];

const COMPANY_STYLES = [
    {
        id: 'standard',
        label: 'Standard',
        labelTr: 'Standart',
        desc: 'Professional, balanced interview',
        icon: Briefcase,
        color: 'bg-slate-700 text-slate-200 border-slate-600',
        activeColor: 'bg-blue-900 border-blue-500 text-blue-200'
    },
    {
        id: 'google',
        label: 'Google Style',
        labelTr: 'Google Tarzı',
        desc: 'Data-driven, Googliness, scalability',
        icon: ({ className }: { className?: string }) => (
            <span className={cn("font-bold text-base leading-none", className)}>G</span>
        ),
        color: 'bg-slate-700 text-slate-200 border-slate-600',
        activeColor: 'bg-blue-900 border-blue-500 text-blue-200'
    },
    {
        id: 'amazon',
        label: 'Amazon Style',
        labelTr: 'Amazon Tarzı',
        desc: 'Leadership Principles, STAR heavy',
        icon: ({ className }: { className?: string }) => (
            <span className={cn("font-bold text-base leading-none", className)}>A</span>
        ),
        color: 'bg-slate-700 text-slate-200 border-slate-600',
        activeColor: 'bg-orange-900 border-orange-500 text-orange-200'
    },
    {
        id: 'startup',
        label: 'Startup',
        labelTr: 'Startup',
        desc: 'Hustle, adaptability, MVP mindset',
        icon: Rocket,
        color: 'bg-slate-700 text-slate-200 border-slate-600',
        activeColor: 'bg-green-900 border-green-500 text-green-200'
    },
    {
        id: 'corporate',
        label: 'Corporate',
        labelTr: 'Kurumsal',
        desc: 'Formal, process-oriented, stakeholder',
        icon: Building,
        color: 'bg-slate-700 text-slate-200 border-slate-600',
        activeColor: 'bg-indigo-900 border-indigo-500 text-indigo-200'
    }
];

const LANGUAGES = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

export function StartInterviewButton({ applicationId, variant = "default", className }: StartInterviewButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [voiceLoading, setVoiceLoading] = useState(false);
    const [type, setType] = useState("hr_behavioral");
    const [language, setLanguage] = useState("en");
    const [companyStyle, setCompanyStyle] = useState("standard");
    const [showProModal, setShowProModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const locale = getCookie('NEXT_LOCALE');
        if (locale === 'en' || locale === 'tr') {
            setLanguage(locale);
        }
    }, [open]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/interview/start', {
                method: 'POST',
                body: JSON.stringify({
                    applicationId,
                    interviewType: type,
                    language,
                    companyStyle
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.status === 403) {
                const err = await res.json();
                if (err.code === 'SUBSCRIPTION_REQUIRED' || err.code === 'FREE_LIMIT_REACHED') {
                    setOpen(false); // Close setup modal
                    setShowProModal(true);
                    setLoading(false);
                    return;
                }
            }

            if (!res.ok) throw new Error('Failed to start session');

            const { sessionId } = await res.json();

            // Store settings in sessionStorage as backup
            sessionStorage.setItem(`interview_${sessionId}`, JSON.stringify({ language, companyStyle }));

            router.push(`/dashboard/interview/${sessionId}`);
        } catch (error) {
            toast.error("Could not start interview. Please try again.");
            setLoading(false);
        }
    };

    const handleVoiceStart = async () => {
        setVoiceLoading(true);
        try {
            const res = await fetch('/api/interview/voice/start', {
                method: 'POST',
                body: JSON.stringify({
                    applicationId,
                    interviewType: type,
                    language,
                    companyStyle
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.status === 403) {
                const err = await res.json();
                if (err.code === 'SUBSCRIPTION_REQUIRED' || err.code === 'FREE_LIMIT_REACHED') {
                    setOpen(false); // Close setup modal
                    setShowProModal(true);
                    setVoiceLoading(false);
                    return;
                }
            }

            if (!res.ok) throw new Error('Failed to start voice session');

            const { sessionId } = await res.json();

            // Store settings in sessionStorage as backup
            sessionStorage.setItem(`interview_${sessionId}`, JSON.stringify({ language, companyStyle, mode: 'voice' }));

            router.push(`/dashboard/interview/voice/${sessionId}`);
        } catch (error) {
            toast.error("Could not start voice interview. Please try again.");
            setVoiceLoading(false);
        }
    };

    const selectedType = INTERVIEW_TYPES.find(t => t.id === type);

    return (
        <>
            <ProComingSoonModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant={variant} className={className}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Start Interview
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[560px] bg-neutral-950 border-neutral-800 text-white p-0 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-800 bg-gradient-to-r from-blue-950/50 to-neutral-950">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            Prepare for Your Interview
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400 mt-1">
                            Set up your practice session for maximum impact.
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                        {/* Step 1: Language */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Languages className="h-4 w-4 text-blue-400" />
                                Interview Language
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setLanguage(lang.id)}
                                        className={cn(
                                            "flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200 text-left",
                                            language === lang.id
                                                ? "border-blue-500 bg-blue-900/30 text-white"
                                                : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-600"
                                        )}
                                    >
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="font-medium text-sm">{lang.label}</span>
                                        {language === lang.id && (
                                            <div className="ml-auto h-2 w-2 rounded-full bg-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Interview Type */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-purple-400" />
                                Interview Focus
                            </h3>
                            <div className="space-y-2">
                                {INTERVIEW_TYPES.map(t => {
                                    const Icon = t.icon;
                                    const isActive = type === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                                                isActive
                                                    ? "border-purple-500 bg-purple-900/20 text-white"
                                                    : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-lg", isActive ? "bg-neutral-800" : "bg-neutral-800/50")}>
                                                <Icon className={cn("h-5 w-5", isActive ? t.color : "text-neutral-500")} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {t.id === 'language'
                                                            ? `${LANGUAGES.find(l => l.id === language)?.label || 'Language'} ${language === 'tr' ? 'Yeterliliği' : 'Proficiency'}`
                                                            : (language === 'tr' ? t.labelTr : t.label)
                                                        }
                                                    </span>
                                                    {t.badge && (
                                                        <Badge className={cn("text-[10px] px-1.5 py-0", t.badge === 'New' ? 'bg-green-600' : 'bg-blue-700')}>
                                                            {t.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {language === 'tr' ? t.descTr : t.desc}
                                                </p>
                                            </div>
                                            {isActive && <ChevronRight className="h-4 w-4 text-purple-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 3: Company Style */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-amber-400" />
                                Interview Style
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {COMPANY_STYLES.map(style => {
                                    const Icon = style.icon;
                                    const isActive = companyStyle === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => setCompanyStyle(style.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all duration-200",
                                                isActive ? style.activeColor : "border-neutral-800 bg-neutral-900/50 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                                            )}
                                            title={style.desc}
                                        >
                                            <div className="h-6 w-6 flex items-center justify-center">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className="text-[11px] font-medium leading-tight">
                                                {language === 'tr' ? style.labelTr : style.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {companyStyle !== 'standard' && (
                                <p className="text-xs text-neutral-500 mt-2 pl-1">
                                    ✨ {COMPANY_STYLES.find(s => s.id === companyStyle)?.desc}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer — Two Mode Buttons */}
                    <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Text Mode */}
                            <Button
                                onClick={handleStart}
                                disabled={loading || voiceLoading}
                                className="h-12 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-900/40"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                                ) : (
                                    <><PlayCircle className="mr-2 h-4 w-4" />
                                        {language === 'tr' ? 'Yazılı Mülakat' : 'Text Mode'}
                                    </>
                                )}
                            </Button>

                            {/* Voice Mode */}
                            <Button
                                onClick={handleVoiceStart}
                                disabled={loading || voiceLoading}
                                className="h-12 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-900/40"
                            >
                                {voiceLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...</>
                                ) : (
                                    <><Mic className="mr-2 h-4 w-4" />
                                        {language === 'tr' ? '🎙️ Sesli Mülakat' : '🎙️ Voice Mode'}
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-center text-neutral-600 text-xs">
                            {language === 'tr' ? 'Sesli mod gerçek zamanlı konuşma sunar • Yaklaşık 10-15 dk' : 'Voice mode offers real-time conversation • Approx. 10-15 min'}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
