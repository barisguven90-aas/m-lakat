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

                <DialogContent className="sm:max-w-[720px] bg-neutral-900 border-neutral-700/50 text-white p-0 overflow-hidden shadow-2xl backdrop-blur-xl rounded-3xl">
                    {/* Header with modern gradient and glass effect */}
                    <div className="relative p-8 pb-6 bg-gradient-to-b from-blue-900/40 via-neutral-900 to-neutral-900 border-b border-neutral-800/60 overflow-hidden">
                        
                        {/* Abstract background glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] -translate-x-1/3 -translate-y-1/3" />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-inner">
                                <Sparkles className="h-7 w-7 text-blue-400" />
                            </div>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                                {language === 'tr' ? 'Mülakatınızı Yapılandırın' : 'Design Your Interview'}
                            </DialogTitle>
                            <DialogDescription className="text-neutral-400 max-w-sm font-medium">
                                {language === 'tr' ? 'Odağı ve tarzı belirleyerek yapay zeka deneyiminizi özelleştirin.' : 'Customize your AI experience by selecting the focus and style.'}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="p-8 space-y-8 bg-neutral-950/50 max-h-[60vh] overflow-y-auto custom-scrollbar">

                        {/* Step 1: Language Selection */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <Languages className="h-3.5 w-3.5 text-blue-500" />
                                {language === 'tr' ? 'Mülakat Dili' : 'Interview Language'}
                            </h3>
                            <div className="flex gap-4">
                                {LANGUAGES.map(lang => {
                                    const isSelected = language === lang.id;
                                    return (
                                        <button
                                            key={lang.id}
                                            onClick={() => setLanguage(lang.id)}
                                            className={cn(
                                                "relative flex-1 group overflow-hidden flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                                                isSelected
                                                    ? "bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border-blue-500/50 shadow-lg shadow-blue-500/10"
                                                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50"
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500" />
                                            )}
                                            <span className="text-2xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{lang.flag}</span>
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                isSelected ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
                                            )}>
                                                {lang.label}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Interview Focus */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-purple-500" />
                                {language === 'tr' ? 'Mülakat Odak Noktası' : 'Interview Focus'}
                            </h3>
                            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-3">
                                {INTERVIEW_TYPES.map(t => {
                                    const Icon = t.icon;
                                    const isActive = type === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={cn(
                                                "relative group flex flex-col items-start gap-4 p-5 rounded-2xl border transition-all duration-300 text-left",
                                                isActive
                                                    ? "bg-gradient-to-br from-purple-900/40 to-fuchsia-900/30 border-purple-500/50 shadow-lg shadow-purple-500/10"
                                                    : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-xl transition-all duration-300 shadow-inner",
                                                isActive ? "bg-purple-500/20" : "bg-neutral-800/80 group-hover:bg-neutral-700"
                                            )}>
                                                <Icon className={cn("h-6 w-6", isActive ? t.color : "text-neutral-400")} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5 mt-2">
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        isActive ? "text-white" : "text-neutral-300 group-hover:text-white"
                                                    )}>
                                                        {t.id === 'language'
                                                            ? `${LANGUAGES.find(l => l.id === language)?.label || 'Language'} ${language === 'tr' ? 'Yeterliliği' : 'Proficiency'}`
                                                            : (language === 'tr' ? t.labelTr : t.label)
                                                        }
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                                                    {language === 'tr' ? t.descTr : t.desc}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/20">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                                </div>
                                            )}
                                            {t.badge && (
                                                <Badge className={cn("absolute bottom-4 right-4 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", t.badge === 'New' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30')}>
                                                    {language === 'tr' && t.badge === 'Most Common' ? 'Sık Tercih' : language === 'tr' && t.badge === 'New' ? 'Yeni' : t.badge}
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 3: Company Style */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-amber-500" />
                                {language === 'tr' ? 'Mülakat Tarzı' : 'Interview Style'}
                            </h3>
                            <div className="grid grid-cols-5 gap-3">
                                {COMPANY_STYLES.map(style => {
                                    const Icon = style.icon;
                                    const isActive = companyStyle === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => setCompanyStyle(style.id)}
                                            className={cn(
                                                "relative group flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300",
                                                isActive 
                                                    ? `${style.activeColor} shadow-md` 
                                                    : "bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300 hover:bg-neutral-800/50"
                                            )}
                                            title={language === 'tr' ? style.labelTr : style.label}
                                        >
                                            <div className="h-8 w-8 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <span className="text-[11px] font-bold tracking-wide">
                                                {language === 'tr' ? style.labelTr : style.label}
                                            </span>
                                            {isActive && (
                                                <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3 px-4 flex items-center gap-3 text-sm">
                                <div className="p-1.5 bg-neutral-800 rounded-md shrink-0">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                </div>
                                <span className="text-neutral-300 font-medium h-5 overflow-hidden block">
                                    <div key={companyStyle} className="animate-in slide-in-from-bottom-2 fade-in duration-300 block">
                                        {COMPANY_STYLES.find(s => s.id === companyStyle)?.desc}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-neutral-800/60 bg-neutral-900 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Text Mode */}
                            <Button
                                onClick={handleStart}
                                disabled={loading || voiceLoading}
                                className="h-14 font-semibold text-sm bg-gradient-to-br from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 text-white border border-neutral-600 shadow-md transition-all duration-300"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {(language === 'tr' ? 'Başlatılıyor...' : 'Starting...')}</>
                                ) : (
                                    <><PlayCircle className="mr-2 h-5 w-5 text-neutral-400" />
                                        {language === 'tr' ? 'Mesajlaşma Modu' : 'Chat Mode'}
                                    </>
                                )}
                            </Button>

                            {/* Voice Mode */}
                            <Button
                                onClick={handleVoiceStart}
                                disabled={loading || voiceLoading}
                                className="h-14 font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all duration-300"
                            >
                                {voiceLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {(language === 'tr' ? 'Başlatılıyor...' : 'Starting...')}</>
                                ) : (
                                    <><Mic className="mr-2 h-5 w-5" />
                                        {language === 'tr' ? 'Gerçek Zamanlı Sesli Mülakat' : 'Real-Time Voice Mode'}
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-center text-neutral-500 text-xs font-medium">
                            {language === 'tr' ? 'Sesli mod interaktif bir konuşma sunar ve yaklaşık 10-15 dk sürer.' : 'Voice mode offers an interactive AI conversation lasting approx. 10-15 min.'}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
