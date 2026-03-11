"use client";

import { useState } from "react";
import { Mail, Lock, Eye, TrendingUp, Brain, MessageSquare, Shield, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScoreBreakdown {
    cv_match: number;
    technical: number;
    communication: number;
    confidence: number;
    behavioral: number;
}

interface ResultsEmailGateProps {
    sessionId: string;
    finalScore: number;
    hireProbability: number;
    breakdown: ScoreBreakdown;
    feedbackSummary: string;
    jobTitle: string;
    language?: string;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
    const r = (size / 2) - 8;
    const circumference = 2 * Math.PI * r;
    const fill = circumference * (1 - score / 100);
    const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={7} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={7}
                strokeDasharray={circumference}
                strokeDashoffset={fill}
                strokeLinecap="round"
            />
        </svg>
    );
}

export function ResultsEmailGate({
    sessionId, finalScore, hireProbability, breakdown, feedbackSummary, jobTitle, language = 'en'
}: ResultsEmailGateProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [error, setError] = useState('');
    const isTr = language === 'tr';

    const scoreColor = finalScore >= 75 ? 'text-emerald-400' : finalScore >= 55 ? 'text-amber-400' : 'text-red-400';
    const hireColor = hireProbability >= 60 ? 'text-emerald-400' : hireProbability >= 40 ? 'text-amber-400' : 'text-red-400';

    const handleUnlock = async () => {
        if (!email || !email.includes('@')) {
            setError(isTr ? 'Geçerli bir e-posta adresi girin.' : 'Please enter a valid email address.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            await fetch('/api/results/collect-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, sessionId, finalScore, hireProbability }),
            });
            setUnlocked(true);
        } catch {
            setError(isTr ? 'Bir hata oluştu. Tekrar deneyin.' : 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const subScores = [
        { label: isTr ? 'CV Eşleşme' : 'CV Match', score: breakdown.cv_match, icon: CheckCircle2, color: 'text-blue-400' },
        { label: isTr ? 'Teknik' : 'Technical', score: breakdown.technical, icon: Brain, color: 'text-purple-400' },
        { label: isTr ? 'İletişim' : 'Communication', score: breakdown.communication, icon: MessageSquare, color: 'text-teal-400' },
        { label: isTr ? 'Özgüven' : 'Confidence', score: breakdown.confidence, icon: Shield, color: 'text-orange-400' },
        { label: isTr ? 'Davranışsal' : 'Behavioral', score: breakdown.behavioral, icon: Heart, color: 'text-pink-400' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isTr ? 'Mülakat Tamamlandı' : 'Interview Complete'}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">{jobTitle}</h1>
                </div>

                {/* Main Score Cards — always visible */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-center">
                        <div className="relative inline-flex items-center justify-center mb-2">
                            <ScoreRing score={finalScore} size={88} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-2xl font-black ${scoreColor}`}>{finalScore}</span>
                                <span className="text-slate-500 text-xs">/100</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs">{isTr ? 'Mülakat Puanı' : 'Interview Score'}</p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-center">
                        <div className="relative inline-flex items-center justify-center mb-2">
                            <ScoreRing score={hireProbability} size={88} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-2xl font-black ${hireColor}`}>{hireProbability}%</span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {isTr ? 'İşe Alım İhtimali' : 'Hire Probability'}
                        </p>
                    </div>
                </div>

                {/* Blurred detail section OR unlocked section */}
                {unlocked ? (
                    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-3">
                        <p className="text-slate-300 text-sm font-medium mb-3">
                            {isTr ? 'Detaylı Puanlarınız' : 'Your Detailed Scores'}
                        </p>
                        {subScores.map(s => (
                            <div key={s.label} className="flex items-center gap-3">
                                <s.icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{s.label}</span>
                                        <span className="text-white font-semibold">{s.score}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${s.score}%`,
                                                backgroundColor: s.score >= 75 ? '#10b981' : s.score >= 55 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {feedbackSummary && (
                            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                <p className="text-slate-300 text-sm leading-relaxed">{feedbackSummary}</p>
                            </div>
                        )}
                        <div className="mt-4 text-center">
                            <p className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                {isTr ? 'Sonuçlarınız e-postanıza gönderildi!' : 'Full results sent to your email!'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Blurred preview of sub-scores */}
                        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 space-y-3 select-none" style={{ filter: 'blur(5px)', pointerEvents: 'none' }}>
                            {subScores.map(s => (
                                <div key={s.label} className="flex items-center gap-3">
                                    <s.icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400">{s.label}</span>
                                            <span className="text-white font-semibold">{s.score}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.score}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Email unlock overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-[#0a0f1e]/95 backdrop-blur-sm border border-slate-600/60 rounded-2xl px-6 py-5 text-center w-full mx-2 shadow-2xl">
                                <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Lock className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="text-white font-bold text-base mb-1">
                                    {isTr ? 'Tam sonuçları görmek için e-postanı gir' : 'Enter your email to unlock full results'}
                                </h3>
                                <p className="text-slate-400 text-xs mb-4">
                                    {isTr ? 'CV eşleşme, teknik puan, davranışsal analiz ve daha fazlası' : 'CV match, technical score, behavioral analysis and more'}
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder={isTr ? 'e-posta@adresin.com' : 'your@email.com'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                        className="flex-1 h-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm"
                                    />
                                    <Button
                                        onClick={handleUnlock}
                                        disabled={isLoading}
                                        className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm whitespace-nowrap"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <><Eye className="w-4 h-4 mr-1" />{isTr ? 'Gör' : 'See Results'}</>
                                        )}
                                    </Button>
                                </div>
                                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                                <p className="text-slate-600 text-xs mt-3">
                                    {isTr ? 'Spam yok. Sadece sonuçlarınız.' : 'No spam. Just your results.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
