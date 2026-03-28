"use client";

import React, { useState } from 'react';
import { MatchAnalysisResult } from '@/lib/matching/analyze-match';
import {
    CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target, TrendingUp,
    Sparkles, ChevronDown, ChevronUp, Shield, Zap, BookOpen, Award,
    Briefcase, GraduationCap, Star, ArrowRight, Brain, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Reusable Sub-Components ---

function SectionHeader({ icon: Icon, title, subtitle, gradient }: {
    icon: React.ElementType; title: string; subtitle?: string; gradient: string;
}) {
    return (
        <div className="flex items-start gap-3 mb-5">
            <div className={cn("p-2.5 rounded-xl shrink-0", gradient)}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "rounded-2xl border border-slate-200/60 dark:border-slate-700/50",
            "bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm",
            "shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30",
            "transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/40",
            className
        )}>
            {children}
        </div>
    );
}

function CollapsibleSection({ 
    icon: Icon, title, subtitle, gradient, defaultOpen = false, children, className
}: {
    icon: React.ElementType; title: string; subtitle?: string; gradient: string; defaultOpen?: boolean; children: React.ReactNode; className?: string;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <GlassCard className={className}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
            >
                <div className="flex items-start gap-3">
                    <div className={cn("p-2.5 rounded-xl shrink-0", gradient)}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </button>
            {isOpen && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-top-4 fade-in duration-300">
                    {children}
                </div>
            )}
        </GlassCard>
    );
}

// --- Score Ring ---
function ScoreRing({ score }: { score: number }) {
    const getScoreColor = (s: number) => {
        if (s >= 80) return { ring: 'text-emerald-500', bg: 'from-emerald-500/20 to-emerald-500/5', label: 'Excellent Match', labelColor: 'text-emerald-600 dark:text-emerald-400' };
        if (s >= 60) return { ring: 'text-blue-500', bg: 'from-blue-500/20 to-blue-500/5', label: 'Good Match', labelColor: 'text-blue-600 dark:text-blue-400' };
        if (s >= 40) return { ring: 'text-amber-500', bg: 'from-amber-500/20 to-amber-500/5', label: 'Moderate Match', labelColor: 'text-amber-600 dark:text-amber-400' };
        return { ring: 'text-red-500', bg: 'from-red-500/20 to-red-500/5', label: 'Needs Work', labelColor: 'text-red-600 dark:text-red-400' };
    };
    const colors = getScoreColor(score);

    return (
        <div className={cn("relative flex flex-col items-center justify-center p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br", colors.bg)}>
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 flex items-center justify-center">
                <svg className="absolute top-0 left-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700" />
                    <circle
                        cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
                        strokeDasharray={Math.PI * 2 * 42}
                        strokeDashoffset={Math.PI * 2 * 42 * (1 - score / 100)}
                        strokeLinecap="round"
                        className={cn("transition-all duration-1000 ease-out", colors.ring)}
                    />
                </svg>
                <div className="text-center z-10">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">{score}</span>
                    <span className="text-lg font-bold text-slate-400">%</span>
                </div>
            </div>
            <span className={cn("mt-3 text-sm font-bold uppercase tracking-wider", colors.labelColor)}>
                {colors.label}
            </span>
        </div>
    );
}

// --- Main Component ---
export function MatchAnalysis({ analysis }: { analysis: MatchAnalysisResult }) {
    const [expandedTip, setExpandedTip] = useState<number | null>(null);
    const [isTr, setIsTr] = useState(false);

    React.useEffect(() => {
        const locale = document.cookie.split('; ').find(row => row.startsWith('NEXT_LOCALE='))?.split('=')[1];
        if (locale === 'tr') setIsTr(true);
    }, []);

    if (!analysis) return null;

    // Backward compat with old data
    const strengths = analysis.strengths || [];
    const gaps = analysis.gaps || [];
    const risks = analysis.risks || [];
    const summary = analysis.summary || "No analysis summary available.";
    const matchScore = analysis.match_score || 0;
    const aiReview = analysis.ai_job_review;
    const tips = analysis.interview_tips || [];
    const profile = analysis.candidate_profile_highlights;

    const priorityColors = {
        must: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        should: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        nice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };

    const severityColors = {
        critical: 'border-l-red-500',
        moderate: 'border-l-amber-500',
        minor: 'border-l-blue-400',
    };

    const relevanceIcons = {
        high: <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />,
        medium: <Star className="h-3.5 w-3.5 text-slate-400 fill-slate-300" />,
        low: <Star className="h-3.5 w-3.5 text-slate-300" />,
    };

    return (
        <div className="space-y-6">

            {/* ─── Executive Summary & Score ─── */}
            {/* ─── Executive Summary & Score ─── */}
            <GlassCard className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center">
                    <ScoreRing score={matchScore} />
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {isTr ? 'Özet Değerlendirme' : 'Executive Summary'}
                            </h3>
                            <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">{summary}</p>

                        {/* Quick Profile Stats */}
                        {profile && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                {profile.total_experience_years > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        {profile.total_experience_years} yrs experience
                                    </div>
                                )}
                                {profile.education_summary && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        {profile.education_summary}
                                    </div>
                                )}
                                {profile.key_skills && profile.key_skills.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
                                        <Zap className="h-3.5 w-3.5" />
                                        {profile.key_skills.length} key skills
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* ─── Interview Preparation Tips (Moved UP) ─── */}
            {tips.length > 0 && (
                <CollapsibleSection icon={Shield} title={isTr ? "Mülakat Hazırlık Rehberi" : "Interview Preparation Guide"} subtitle={isTr ? "Mülakat öncesi odaklanmanız gereken alanlar" : "Key areas to focus on before your interview"} gradient="bg-gradient-to-br from-orange-500 to-red-500" className="border-orange-200/40 dark:border-orange-700/30">
                    <div className="space-y-3">
                        {tips.map((tip, i) => {
                            const t = typeof tip === 'string' ? { title: tip, description: '', priority: 'should' as const } : tip;
                            const isExpanded = expandedTip === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setExpandedTip(isExpanded ? null : i)}
                                    className="w-full text-left"
                                >
                                    <div className={cn(
                                        "p-4 rounded-xl border transition-all duration-200",
                                        isExpanded
                                            ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-md"
                                            : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/40 hover:border-slate-300 dark:hover:border-slate-600"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                priorityColors[t.priority || 'should']
                                            )}>
                                                {t.priority === 'must' ? '🔴 Must' : t.priority === 'nice' ? '🔵 Nice' : '🟠 Should'}
                                            </span>
                                            <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{t.title}</p>
                                        </div>
                                        {isExpanded && t.description && (
                                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-16">
                                                {t.description}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CollapsibleSection>
            )}

            {/* ─── Candidate Key Skills ─── */}
            {profile && profile.key_skills && profile.key_skills.length > 0 && (
                <CollapsibleSection defaultOpen={true} icon={Zap} title={isTr ? "Eşleşen Becerileriniz" : "Your Matching Skills"} subtitle={isTr ? "Sizin sahip olduğunuz ve şirketin aradığı beceriler" : "Skills you have that the company is looking for"} gradient="bg-gradient-to-br from-violet-500 to-purple-600">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {profile.key_skills.map((skill, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-violet-500" />
                                {skill}
                            </span>
                        ))}
                    </div>
                    {profile.career_trajectory && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-violet-50/30 dark:from-slate-800/50 dark:to-violet-900/10 border border-slate-200/50 dark:border-slate-700/40">
                            <TrendingUp className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Career Trajectory</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{profile.career_trajectory}</p>
                            </div>
                        </div>
                    )}
                    {profile.notable_achievements && profile.notable_achievements.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5" /> Notable Achievements
                            </p>
                            {profile.notable_achievements.map((ach, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <ArrowRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>{ach}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CollapsibleSection>
            )}

            {/* ─── Strengths & Gaps Side-by-Side ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Strengths */}
                <CollapsibleSection icon={CheckCircle2} title={isTr ? "Güçlü Yönler" : "Strengths"} subtitle={`${strengths.length} ${isTr ? "eşleşme noktası bulundu" : "alignment points identified"}`} gradient="bg-gradient-to-br from-emerald-500 to-green-600">
                    <div className="space-y-3">
                        {strengths.length > 0 ? strengths.map((s, i) => {
                            const strength = typeof s === 'string' ? { title: s, description: '', relevance: 'medium' as const } : s;
                            return (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                    <div className="mt-0.5">
                                        {relevanceIcons[strength.relevance || 'medium']}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{strength.title}</p>
                                        {strength.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{strength.description}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-slate-400 italic">No specific strengths identified.</p>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Gaps */}
                <CollapsibleSection icon={AlertTriangle} title={`${gaps.length} ${isTr ? "Gelişim Alanı" : "Areas to Improve"}`} subtitle={isTr ? "Bu noktalara odaklanmanızı öneririz" : "We recommend focusing on these points"} gradient="bg-gradient-to-br from-amber-500 to-orange-600">
                    <div className="space-y-3">
                        {gaps.length > 0 ? gaps.map((g, i) => {
                            const gap = typeof g === 'string' ? { title: g, description: '', severity: 'moderate' as const, suggestion: '' } : g;
                            return (
                                <div key={i} className={cn(
                                    "p-3 rounded-xl border-l-4 bg-amber-50/30 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20",
                                    severityColors[gap.severity || 'moderate']
                                )}>
                                    <div className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gap.title}</p>
                                            {gap.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{gap.description}</p>
                                            )}
                                            {gap.suggestion && (
                                                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/40">
                                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">{gap.suggestion}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-slate-400 italic">No specific gaps identified.</p>
                        )}
                    </div>
                </CollapsibleSection>
            </div>

            {/* ─── AI Job Review ─── */}
            {aiReview && (
                <CollapsibleSection icon={Brain} title={isTr ? "Yapay Zeka İş Analizi" : "AI Job Analysis"} subtitle={isTr ? "Yapay zekanın iş ilanı ve şirket hakkındaki yorumu" : "AI's interpretation of the job posting and company"} gradient="bg-gradient-to-br from-indigo-500 to-blue-600" className="border-indigo-200/40 dark:border-indigo-700/30">
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{aiReview.overview}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Culture */}
                        {aiReview.company_culture_hints && aiReview.company_culture_hints.length > 0 && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-900/15 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800/30">
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5" /> Company Culture Signals
                                </p>
                                <ul className="space-y-2">
                                    {aiReview.company_culture_hints.map((hint, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                            {hint}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Role Expectations */}
                        {aiReview.role_expectations && aiReview.role_expectations.length > 0 && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/40 dark:from-blue-900/15 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/30">
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5" /> Hidden Role Expectations
                                </p>
                                <ul className="space-y-2">
                                    {aiReview.role_expectations.map((exp, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                                            {exp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {aiReview.salary_range_hint && (
                        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 text-sm text-emerald-700 dark:text-emerald-400">
                            <TrendingUp className="h-4 w-4 shrink-0" />
                            <span className="font-medium">{isTr ? 'Tahmini Maaş Aralığı:' : 'Estimated Range:'}</span> {aiReview.salary_range_hint}
                        </div>
                    )}
                </CollapsibleSection>
            )}

        </div>
    );
}
