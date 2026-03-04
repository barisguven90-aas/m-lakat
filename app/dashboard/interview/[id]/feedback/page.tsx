import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { generateComprehensiveFeedback } from '@/lib/feedback/generate-feedback';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SendReportButton } from '@/components/interview/SendReportButton';
import {
    CheckCircle, AlertTriangle, XCircle, ArrowLeft, Target, TrendingUp,
    TrendingDown, Minus, Brain, MessageSquare, Sparkles, Award, Shield,
    Zap, ChevronDown, Star, BarChart3, BookOpen, Lightbulb,
    Loader2, ArrowRight, GraduationCap
} from 'lucide-react';

function ScoreRing({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' }) {
    const getColor = (s: number) => {
        if (s >= 80) return { ring: 'text-emerald-500', label: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500/15' };
        if (s >= 60) return { ring: 'text-blue-500', label: 'text-blue-600 dark:text-blue-400', bg: 'from-blue-500/15' };
        if (s >= 40) return { ring: 'text-amber-500', label: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-500/15' };
        return { ring: 'text-red-500', label: 'text-red-600 dark:text-red-400', bg: 'from-red-500/15' };
    };
    const c = getColor(score);
    const r = size === 'sm' ? 30 : 42;
    const svgSize = size === 'sm' ? 80 : 110;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: svgSize, height: svgSize }}>
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox={`0 0 ${svgSize} ${svgSize}`}>
                    <circle cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke="currentColor" strokeWidth={size === 'sm' ? 4 : 5} className="text-slate-200 dark:text-slate-700" />
                    <circle
                        cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke="currentColor" strokeWidth={size === 'sm' ? 4 : 5}
                        strokeDasharray={Math.PI * 2 * r}
                        strokeDashoffset={Math.PI * 2 * r * (1 - score / 100)}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${c.ring}`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${size === 'sm' ? 'text-lg' : 'text-2xl'} font-black text-slate-900 dark:text-white`}>{score}</span>
                </div>
            </div>
            <span className={`text-xs font-semibold ${c.label} text-center`}>{label}</span>
        </div>
    );
}

function QuestionFeedbackCard({ qf, index }: { qf: any; index: number }) {
    const scoreColor = qf.score >= 75 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/30'
        : qf.score >= 55 ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/30'
            : 'text-red-500 bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800/30';
    const ScoreIcon = qf.score >= 75 ? TrendingUp : qf.score >= 55 ? Minus : TrendingDown;

    return (
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg overflow-hidden">
            {/* Question Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {index + 1}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Question {index + 1}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${scoreColor}`}>
                    <ScoreIcon className="h-3.5 w-3.5" />
                    {qf.score}/100
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Question */}
                <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 mt-0.5">
                        <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Question</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">&quot;{qf.question}&quot;</p>
                    </div>
                </div>

                {/* Answer */}
                <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 mt-0.5">
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Your Answer</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">&quot;{qf.answer}&quot;</p>
                    </div>
                </div>

                {/* AI Commentary */}
                <div className="bg-gradient-to-r from-violet-50/80 to-indigo-50/50 dark:from-violet-900/10 dark:to-indigo-900/5 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">AI Coach Analysis</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{qf.ai_commentary}</p>
                </div>

                {/* Good / Improve Grid */}
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">What Was Good</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{qf.what_was_good}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">What To Improve</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{qf.what_to_improve}</p>
                    </div>
                </div>

                {/* Ideal Answer Hint */}
                {qf.ideal_answer_hint && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/30">
                        <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">💡 Pro Tip: </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{qf.ideal_answer_hint}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default async function FeedbackPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const sessionId = (await params).id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: session } = await supabase
        .from('interview_sessions')
        .select('*, applications(*), session_feedback(*), interview_turns(*)')
        .eq('id', sessionId)
        .single();

    if (!session) notFound();

    let feedback = session.session_feedback?.[0];

    if (!feedback && session.status === 'completed') {
        const validTurns = (session.interview_turns || []).filter((t: any) => t.response_text && t.response_text.trim());

        if (validTurns.length === 0) {
            const { data: saved } = await supabase
                .from('session_feedback')
                .insert({
                    session_id: sessionId,
                    job_match_score: 50,
                    star_methodology_score: 50,
                    clarity_score: 50,
                    strengths: ['You started the interview process!'],
                    weaknesses: ['No answers were recorded for this session.'],
                    high_risk_areas: [],
                    improvement_actions: ['Complete a full interview session to get a detailed report.'],
                    summary_text: 'This session did not have enough data to generate a full analysis. Please complete a new interview session for a comprehensive report.'
                })
                .select()
                .single();
            if (saved) feedback = saved;
        } else {
            const generated = await generateComprehensiveFeedback(
                session.interview_type,
                session.applications,
                session.applications?.cv_parsed_data,
                validTurns.sort((a: any, b: any) => a.turn_number - b.turn_number)
            );

            const { data: saved, error } = await supabase
                .from('session_feedback')
                .insert({
                    session_id: sessionId,
                    ...generated
                })
                .select()
                .single();

            if (!error) feedback = saved;
        }
    }

    if (!feedback) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold">Generating Your Feedback...</h2>
                    <p className="text-sm text-slate-500 max-w-sm">Our AI coach is analyzing your interview performance in detail. Please refresh in a moment.</p>
                </div>
            </div>
        );
    }

    const questionFeedbacks = feedback.question_feedbacks || [];
    const detailedStrengths = feedback.detailed_strengths || [];
    const detailedWeaknesses = feedback.detailed_weaknesses || [];
    const aiCommentary = feedback.ai_coach_commentary || '';
    const practiceRecs = feedback.practice_recommendations || [];

    const overallAvg = Math.round(
        ((feedback.job_match_score || 0) +
            (feedback.star_methodology_score || 0) +
            (feedback.clarity_score || 0) +
            (feedback.confidence_score || feedback.clarity_score || 0) +
            (feedback.relevance_score || feedback.job_match_score || 0)) / 5
    );

    const getLevel = (score: number) => {
        if (score < 41) return { label: 'Beginner', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '🌱' };
        if (score < 61) return { label: 'Intermediate', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '📈' };
        if (score < 81) return { label: 'Advanced', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🚀' };
        return { label: 'Expert', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '👑' };
    };
    const level = getLevel(overallAvg);

    return (
        <div className="min-h-screen">
            {/* ─── Hero Header ─── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
                <div className="absolute top-10 left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-[15%] w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />

                <div className="relative container mx-auto px-6 pt-6 pb-10">
                    <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white hover:bg-white/10 mb-6 -ml-2">
                        <Link href="/dashboard/interviews">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Interviews
                        </Link>
                    </Button>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-slate-200">
                                <Award className="h-3.5 w-3.5" /> Interview Feedback Report
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                {session.applications?.job_title || 'Interview'} Feedback
                            </h1>
                            <p className="text-slate-400">
                                {session.applications?.job_company || ''} • {session.interview_type?.replace('_', ' ')} Interview
                            </p>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border mt-3 ${level.color}`}>
                                <span>{level.icon}</span>
                                <span>{level.label} Level</span>
                                <span className="text-xs opacity-60">({overallAvg}/100)</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <SendReportButton sessionId={sessionId} />
                            <Button variant="outline" asChild className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                                <Link href="/dashboard">
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Content ─── */}
            <div className="container mx-auto px-6 py-8 max-w-5xl space-y-8">

                {/* ─── Score Overview ─── */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-center">
                        <ScoreRing score={overallAvg} label="Overall Score" />
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                            <ScoreRing score={feedback.job_match_score || 0} label="Genel Eşleşme Puanı" size="sm" />
                            <ScoreRing score={feedback.star_methodology_score || 0} label="Star Metodu" size="sm" />
                            <ScoreRing score={feedback.clarity_score || 0} label="Cevap Yeterliliği" size="sm" />
                            <ScoreRing score={feedback.confidence_score || feedback.clarity_score || 0} label="Tatmin Puanı" size="sm" />
                            <ScoreRing score={feedback.relevance_score || feedback.job_match_score || 0} label="İlgi Düzeyi" size="sm" />
                        </div>
                    </div>
                </div>

                {/* ─── AI Coach Commentary ─── */}
                {aiCommentary && (
                    <div className="rounded-2xl border border-violet-200/50 dark:border-violet-700/30 bg-gradient-to-br from-violet-50/80 to-indigo-50/40 dark:from-violet-900/10 dark:to-indigo-900/5 shadow-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20 shrink-0">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Coach&apos;s Message</h3>
                                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mb-3">Personal feedback from your AI interview coach</p>
                                <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">{aiCommentary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Executive Summary ─── */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Executive Summary</h3>
                            <p className="text-sm text-slate-500">How a hiring manager would summarize your performance</p>
                        </div>
                    </div>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{feedback.summary_text}</p>
                </div>

                {/* ─── Per-Question Analysis ─── */}
                {questionFeedbacks.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Question-by-Question Analysis</h2>
                                <p className="text-sm text-slate-500">Detailed AI feedback for each of your answers</p>
                            </div>
                        </div>

                        {questionFeedbacks.map((qf: any, i: number) => (
                            <QuestionFeedbackCard key={i} qf={qf} index={i} />
                        ))}
                    </div>
                )}

                {/* ─── Strengths & Weaknesses ─── */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Detailed Strengths */}
                    <div className="rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Güçlü Yanlarınız</h3>
                                <p className="text-sm text-slate-500">{detailedStrengths.length > 0 ? 'Mülakattaki cevaplarınızla kanıtlanmış analiz' : `${(feedback.strengths || []).length} strengths identified`}</p>
                            </div>
                        </div>

                        {detailedStrengths.length > 0 ? (
                            <div className="space-y-4">
                                {detailedStrengths.map((s: any, i: number) => (
                                    <div key={i} className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.title}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{s.description}</p>
                                        {s.evidence && (
                                            <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-emerald-100/50 dark:border-emerald-900/10">
                                                <span className="text-[10px] text-emerald-500 font-bold uppercase shrink-0 mt-0.5">Evidence:</span>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">&quot;{s.evidence}&quot;</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {(feedback.strengths || []).map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Detailed Weaknesses */}
                    <div className="rounded-2xl border border-amber-200/50 dark:border-amber-700/30 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Geliştirilmesi Gereken Yönler</h3>
                                <p className="text-sm text-slate-500">{detailedWeaknesses.length > 0 ? 'Somut aksiyon önerileri ile' : `${(feedback.weaknesses || []).length} areas identified`}</p>
                            </div>
                        </div>

                        {detailedWeaknesses.length > 0 ? (
                            <div className="space-y-4">
                                {detailedWeaknesses.map((w: any, i: number) => {
                                    const severityColors: Record<string, string> = {
                                        critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                        moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                        minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                    };
                                    return (
                                        <div key={i} className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <XCircle className="h-4 w-4 text-amber-500" />
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{w.title}</span>
                                                {w.severity && (
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityColors[w.severity] || severityColors.moderate}`}>
                                                        {w.severity}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{w.description}</p>
                                            {w.suggestion && (
                                                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/40">
                                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{w.suggestion}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {(feedback.weaknesses || []).map((w: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ─── High Risk Areas ─── */}
                {feedback.high_risk_areas && feedback.high_risk_areas.length > 0 && (
                    <div className="rounded-2xl border border-red-200/50 dark:border-red-700/30 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">High Risk Factors</h3>
                                <p className="text-sm text-slate-500">Issues that could affect the hiring decision</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {feedback.high_risk_areas.map((r: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── Action Plan & Practice ─── */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Action Plan */}
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Action Plan</h3>
                                <p className="text-sm text-slate-500">Steps to take before your real interview</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {(feedback.improvement_actions || []).map((action: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{action}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Practice Recommendations */}
                    {practiceRecs.length > 0 && (
                        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg p-6">
                            <div className="flex items-start gap-3 mb-5">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Practice Exercises</h3>
                                    <p className="text-sm text-slate-500">Specific drills to sharpen your skills</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {practiceRecs.map((rec: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/30 dark:bg-orange-900/5 border border-orange-100 dark:border-orange-900/20">
                                        <Zap className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── CTA ─── */}
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-8 text-center border border-slate-700/50 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-2">Ready to improve?</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Practice makes perfect. Start another interview session to work on the areas identified above.</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                            <Link href={`/dashboard/applications/${session.application_id}`}>
                                View Application
                            </Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/40">
                            <Link href={`/dashboard/applications/${session.application_id}`}>
                                <Sparkles className="h-4 w-4 mr-2" /> Practice Again
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
