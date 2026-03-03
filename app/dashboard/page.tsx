"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Briefcase, MessageSquare, ArrowRight, Loader2, Plus,
    BookOpen, Target, Sparkles, Rocket,
    Upload, Play, BarChart3, Users,
    CheckCircle, Clock, Mic
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        applications: 0,
        interviews: 0,
        completedInterviews: 0,
        avgScore: 0
    });
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [recentSessions, setRecentSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const supabase = createClient();

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                const fullName = profile?.full_name || user.user_metadata?.full_name;
                setUserName(fullName ? fullName.split(' ')[0] : 'there');
                const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                const { count: sessionCount } = await supabase.from('interview_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                const { data: sessionsWithFeedback } = await supabase.from('interview_sessions').select('*, session_feedback(job_match_score)').eq('user_id', user.id).eq('status', 'completed');

                let totalScore = 0;
                let scoreCount = 0;
                sessionsWithFeedback?.forEach((s: any) => {
                    if (s.session_feedback?.[0]?.job_match_score) {
                        totalScore += s.session_feedback[0].job_match_score;
                        scoreCount++;
                    }
                });

                setStats({
                    applications: appCount || 0,
                    interviews: sessionCount || 0,
                    completedInterviews: scoreCount,
                    avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
                });

                const { data: apps } = await supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3);
                setRecentApplications(apps || []);

                const { data: sessions } = await supabase.from('interview_sessions').select('*, applications(job_title, job_company)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3);
                setRecentSessions(sessions || []);


            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm text-muted-foreground">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    const isNewUser = stats.applications === 0 && stats.interviews === 0;

    // ─── ONBOARDING VIEW (First-time users) ───
    if (isNewUser) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-4xl mx-auto">
                {/* Welcome Hero */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a3a 40%, #0a1628 70%, #060d1f 100%)' }}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.2),transparent)]" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 p-8 md:p-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium mb-4">
                            <Sparkles className="h-3 w-3" /> Welcome to Interview Coach
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
                            Hey {userName}! 👋
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl font-light max-w-lg mb-8">
                            Your AI-powered interview coach is ready to help you land your dream job. Let&apos;s get started in 3 simple steps.
                        </p>
                    </div>
                </div>

                {/* Getting Started Steps */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-blue-500" /> Getting Started
                    </h2>

                    <div className="grid md:grid-cols-3 gap-5">
                        {/* Step 1 — Active */}
                        <Link href="/dashboard/applications/new" className="block">
                            <Card className="group relative overflow-hidden border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-blue-900/10 h-full">
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-500">STEP 1</span>
                                    </div>
                                    <CardTitle className="text-lg mt-3">Add Your First Application</CardTitle>
                                    <CardDescription className="text-sm">
                                        Paste a job URL or enter details manually. Upload your CV and we&apos;ll analyze the match.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white">
                                        New Application <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Step 2 — Dimmed */}
                        <Card className="group relative overflow-hidden border-slate-200 dark:border-slate-800 opacity-75">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30" />
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Play className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-xs font-bold text-purple-400/60">STEP 2</span>
                                </div>
                                <CardTitle className="text-lg mt-3 text-slate-400">Practice Interview</CardTitle>
                                <CardDescription className="text-sm">
                                    Start a mock interview with AI. Choose type, language, and company style.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-xs text-muted-foreground text-center py-2 italic">Complete Step 1 first</div>
                            </CardContent>
                        </Card>

                        {/* Step 3 — Dimmed */}
                        <Card className="group relative overflow-hidden border-slate-200 dark:border-slate-800 opacity-60">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500/20 to-green-500/20" />
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400/40">STEP 3</span>
                                </div>
                                <CardTitle className="text-lg mt-3 text-slate-500">Get AI Feedback</CardTitle>
                                <CardDescription className="text-sm">
                                    Receive a detailed report with strengths, weaknesses, and actionable tips.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-xs text-muted-foreground text-center py-2 italic">Complete Step 2 first</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // ─── RETURNING USER VIEW ───
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a3a 40%, #0a1628 70%, #060d1f 100%)' }}>
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(99,179,237,0.4)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/8 rounded-full blur-2xl translate-y-1/2" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />

                <div className="relative z-10 p-8 md:p-12 flex flex-col items-start gap-6 max-w-3xl">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl font-light">
                            Your personal AI coach is ready. Let&apos;s tackle your next career milestone.
                        </p>
                    </div>

                    <Link href="/dashboard/applications/new">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 border-0 h-12 px-6 text-lg">
                            <Plus className="mr-2 h-5 w-5" /> New Application
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-muted/60 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.applications}</div>
                                <div className="text-xs text-muted-foreground">Applications</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-muted/60 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.interviews}</div>
                                <div className="text-xs text-muted-foreground">Interviews</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-muted/60 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.completedInterviews}</div>
                                <div className="text-xs text-muted-foreground">Completed</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-muted/60 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.avgScore > 0 ? `${stats.avgScore}%` : '—'}</div>
                                <div className="text-xs text-muted-foreground">Avg Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-sm border-muted/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-gray-500" /> Recent Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentApplications.length === 0 ? (
                            <div className="text-center py-12 px-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors duration-500" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 flex items-center justify-center mb-5 shadow-inner border border-white/50 dark:border-white/5">
                                        <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-center leading-relaxed">
                                        Paste a job posting URL or enter details manually. We'll analyze your fit and prepare custom interview questions.
                                    </p>
                                    <Link href="/dashboard/applications/new">
                                        <Button className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border-0 rounded-full font-semibold transition-all hover:scale-105 active:scale-95">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add First Application
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentApplications.map(app => (
                                    <Link key={app.id} href={`/dashboard/applications/${app.id}`} className="block">
                                        <div className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-sm">
                                                    {app.job_company?.charAt(0).toUpperCase() || "J"}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold leading-none text-base">{app.job_title}</p>
                                                    <p className="text-sm text-muted-foreground">{app.job_company}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {app.match_score && (
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.match_score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : app.match_score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {app.match_score}%
                                                    </span>
                                                )}
                                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Link href="/dashboard/applications" className="block">
                                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                                        View all applications <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-muted/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-gray-500" /> Recent Interviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSessions.length === 0 ? (
                            <div className="text-center py-12 px-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 shadow-sm relative overflow-hidden group h-full min-h-[300px] flex flex-col justify-center">
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/10 transition-colors duration-500" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/20 flex items-center justify-center mb-5 shadow-inner border border-white/50 dark:border-white/5">
                                        <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No sessions yet</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[240px] text-center leading-relaxed">
                                        Complete your first mock interview to view history, feedback, and performance tracking.
                                    </p>
                                    <Link href="/dashboard/applications">
                                        <Button variant="outline" className="h-11 px-6 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-semibold transition-all">
                                            <Play className="h-4 w-4 mr-2" />
                                            Start Practicing
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentSessions.map(session => {
                                    const isVoice = session.config?.mode === 'voice';
                                    const activeHref = isVoice
                                        ? `/dashboard/interview/voice/${session.id}`
                                        : `/dashboard/interview/${session.id}`;
                                    const href = session.status === 'completed'
                                        ? `/dashboard/interview/${session.id}/feedback`
                                        : activeHref;
                                    return (
                                        <Link
                                            key={session.id}
                                            href={href}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm ${session.status === 'completed' ? 'bg-green-500 shadow-green-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                                                    <div className="truncate">
                                                        <span className="font-medium block truncate max-w-[150px] text-base">{session.applications?.job_title || 'Interview'}</span>
                                                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isVoice && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-medium flex items-center gap-0.5">
                                                            <Mic className="h-2.5 w-2.5" />
                                                        </span>
                                                    )}
                                                    {session.status === 'completed' ? (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium">Completed</span>
                                                    ) : (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 font-medium flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> In Progress
                                                        </span>
                                                    )}
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                <Link href="/dashboard/interviews" className="block">
                                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                                        View all interviews <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
