"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Trophy, TrendingUp, Brain, MessageSquare, Heart, Shield,
    Share2, ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react";

interface ScoreBreakdown {
    cv_match: number;
    technical: number;
    communication: number;
    confidence: number;
    behavioral: number;
}

interface InterviewResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    finalScore: number;
    hireProbability: number;
    breakdown: ScoreBreakdown;
    feedbackSummary: string;
    jobTitle: string;
    companyName?: string;
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
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
        </svg>
    );
}

function SubScoreBar({ label, score, icon: Icon, color }: { label: string; score: number; icon: any; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
            <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-semibold">{score}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${score}%`, backgroundColor: score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444' }}
                    />
                </div>
            </div>
        </div>
    );
}

export function InterviewResultModal({
    isOpen, onClose, sessionId,
    finalScore, hireProbability, breakdown, feedbackSummary,
    jobTitle, companyName, language = 'en'
}: InterviewResultModalProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        if (isOpen) setTimeout(() => setAnimated(true), 200);
        else setAnimated(false);
    }, [isOpen]);

    const isTr = language === 'tr';

    const getScoreLabel = (s: number) => {
        if (s >= 85) return isTr ? 'Mükemmel' : 'Excellent';
        if (s >= 70) return isTr ? 'İyi' : 'Good';
        if (s >= 55) return isTr ? 'Orta' : 'Fair';
        return isTr ? 'Geliştirilmeli' : 'Needs Work';
    };

    const scoreColor = finalScore >= 75 ? 'text-emerald-400' : finalScore >= 55 ? 'text-amber-400' : 'text-red-400';
    const hireColor = hireProbability >= 60 ? 'text-emerald-400' : hireProbability >= 40 ? 'text-amber-400' : 'text-red-400';

    const handleShare = async () => {
        const shareText = `🎯 ${isTr ? 'AI Mülakat Simülasyonu Tamamlandı!' : 'AI Interview Simulation Complete!'}

${isTr ? 'Pozisyon' : 'Role'}: ${jobTitle}${companyName ? ` @ ${companyName}` : ''}
${isTr ? 'Puan' : 'Score'}: ${finalScore}/100
${isTr ? 'İşe Alım İhtimali' : 'Hire Probability'}: ${hireProbability}%

${isTr ? 'Dene' : 'Try it'} → intervioai.com`;

        try {
            if (navigator.share) {
                await navigator.share({ text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            }
        } catch { /* silently fail */ }
    };

    const handleViewReport = () => {
        onClose();
        router.push(`/dashboard/interview/${sessionId}/feedback`);
    };

    const subScores = [
        { label: isTr ? 'CV Eşleşme' : 'CV Match', score: breakdown.cv_match, icon: CheckCircle2, color: 'text-blue-400' },
        { label: isTr ? 'Teknik' : 'Technical', score: breakdown.technical, icon: Brain, color: 'text-purple-400' },
        { label: isTr ? 'İletişim' : 'Communication', score: breakdown.communication, icon: MessageSquare, color: 'text-teal-400' },
        { label: isTr ? 'Özgüven' : 'Confidence', score: breakdown.confidence, icon: Shield, color: 'text-orange-400' },
        { label: isTr ? 'Davranışsal' : 'Behavioral', score: breakdown.behavioral, icon: Heart, color: 'text-pink-400' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-lg border-0 p-0 overflow-hidden rounded-2xl bg-[#0f172a]">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-8 pb-6 text-center border-b border-slate-700/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                                {isTr ? 'Mülakat Tamamlandı' : 'Interview Complete'}
                            </span>
                        </div>
                        <h2 className="text-white font-bold text-xl mt-1">{jobTitle}</h2>
                        {companyName && <p className="text-slate-400 text-sm">{companyName}</p>}
                    </div>
                </div>

                {/* Main Scores */}
                <div className="px-6 py-5">
                    <div className="flex items-center justify-around mb-6">
                        {/* Final Score */}
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <ScoreRing score={animated ? finalScore : 0} size={96} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-2xl font-black ${scoreColor}`}>{finalScore}</span>
                                    <span className="text-slate-500 text-xs">/100</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">{isTr ? 'Mülakat Puanı' : 'Interview Score'}</p>
                            <p className={`text-sm font-bold ${scoreColor}`}>{getScoreLabel(finalScore)}</p>
                        </div>

                        {/* Divider */}
                        <div className="h-20 w-px bg-slate-700" />

                        {/* Hire Probability */}
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center">
                                <ScoreRing score={animated ? hireProbability : 0} size={96} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-2xl font-black ${hireColor}`}>{hireProbability}%</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">{isTr ? 'İşe Alım İhtimali' : 'Hire Probability'}</p>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                                <TrendingUp className={`w-3 h-3 ${hireColor}`} />
                                <span className={`text-xs font-bold ${hireColor}`}>
                                    {hireProbability >= 60 ? (isTr ? 'Güçlü' : 'Strong') : hireProbability >= 40 ? (isTr ? 'Orta' : 'Fair') : (isTr ? 'Düşük' : 'Low')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sub Scores */}
                    <div className="space-y-2.5 mb-5">
                        {subScores.map(s => (
                            <SubScoreBar key={s.label} {...s} />
                        ))}
                    </div>

                    {/* AI Feedback */}
                    {feedbackSummary && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 mb-5">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-slate-300 text-sm leading-relaxed">{feedbackSummary}</p>
                            </div>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 gap-1.5"
                            onClick={handleShare}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            {copied ? (isTr ? 'Kopyalandı!' : 'Copied!') : (isTr ? 'Paylaş' : 'Share')}
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                            onClick={handleViewReport}
                        >
                            {isTr ? 'Detaylı Rapor' : 'Full Report'}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
