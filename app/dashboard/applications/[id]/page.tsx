import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { MatchAnalysis } from '@/components/application/MatchAnalysis';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import {
    ArrowLeft, ArrowRight, CheckCircle, Clock, Briefcase,
    Building2, MapPin, CalendarDays, FileText, BarChart3, Play
} from 'lucide-react';
import { CVPreview } from '@/components/cv-upload/CVPreview';
import { StartInterviewButton } from '@/components/interview/StartInterviewButton';
import { formatDistanceToNow } from 'date-fns';

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const id = (await params).id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: app, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !app) {
        notFound();
    }

    // Fetch related sessions
    const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('application_id', id)
        .order('created_at', { ascending: false });

    const completedCount = sessions?.filter((s: any) => s.status === 'completed').length || 0;
    const avgScore = sessions && sessions.length > 0
        ? Math.round(sessions.filter((s: any) => s.overall_score).reduce((acc: number, s: any) => acc + (s.overall_score || 0), 0) / Math.max(sessions.filter((s: any) => s.overall_score).length, 1))
        : null;

    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* ─── Hero Header ─── */}
            <div className="relative overflow-hidden -mx-4 -mt-10 rounded-b-2xl sm:rounded-b-3xl">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-20 right-[15%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-[40%] w-96 h-40 bg-purple-500/8 rounded-full blur-3xl" />
                </div>

                <div className="relative px-4 sm:px-6 pt-14 sm:pt-16 pb-8 sm:pb-10">
                    {/* Back Button */}
                    <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white hover:bg-white/10 mb-6 -ml-2">
                        <Link href="/dashboard/applications">
                            <ArrowLeft className="h-4 w-4 mr-2" /> All Applications
                        </Link>
                    </Button>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                        <div className="space-y-3">
                            {/* Company Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-slate-200">
                                <Building2 className="h-3.5 w-3.5" /> {app.job_company}
                            </div>

                            {/* Job Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                                {app.job_title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                {app.created_at && (
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                                    </span>
                                )}
                                {app.match_score && (
                                    <span className="flex items-center gap-1.5">
                                        <BarChart3 className="h-3.5 w-3.5" />
                                        Match Score: <span className="text-white font-bold">{app.match_score}%</span>
                                    </span>
                                )}
                                {completedCount > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                        {completedCount} interview{completedCount > 1 ? 's' : ''} completed
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA */}
                        <StartInterviewButton
                            applicationId={app.id}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-xl shadow-blue-900/40 h-12 text-base px-8"
                        />
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="py-6 sm:py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Tabs Content (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="analysis">
                            <TabsList className="w-full flex h-auto p-1 bg-slate-100 dark:bg-slate-800/50 overflow-x-auto overflow-y-hidden no-scrollbar justify-start md:grid md:grid-cols-3 md:h-12">
                                <TabsTrigger value="analysis" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm h-9 md:h-10 text-xs md:text-sm px-4 md:px-2 whitespace-nowrap">
                                    <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" /> Analysis
                                </TabsTrigger>
                                <TabsTrigger value="job" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm h-9 md:h-10 text-xs md:text-sm px-4 md:px-2 whitespace-nowrap">
                                    <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4" /> Job Description
                                </TabsTrigger>
                                <TabsTrigger value="cv" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm h-9 md:h-10 text-xs md:text-sm px-4 md:px-2 whitespace-nowrap">
                                    <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" /> CV / Profile
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="analysis" className="mt-6">
                                {app.match_analysis ? (
                                    <MatchAnalysis analysis={app.match_analysis} />
                                ) : (
                                    <Card className="border-dashed">
                                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                                                <BarChart3 className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Analysis Not Available</p>
                                            <p className="text-sm text-slate-400 mt-1 max-w-sm">The AI analysis could not be generated. Try creating a new application with more detailed job and profile information.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="job" className="mt-6">
                                <Card className="border-slate-200/60 dark:border-slate-700/50 shadow-lg">
                                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-blue-500" /> Full Job Description
                                        </CardTitle>
                                        <CardDescription>{app.job_company} — {app.job_title}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6 whitespace-pre-wrap">
                                        {app.job_description}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="cv" className="mt-6">
                                <CVPreview data={app.cv_parsed_data} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Sidebar (1/3) */}
                    <div className="space-y-6">
                        {/* Interview Sessions Card */}
                        <Card className="border-slate-200/60 dark:border-slate-700/50 shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-900/10 border-b">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Play className="h-4 w-4 text-indigo-500" /> Interview Sessions
                                </CardTitle>
                                <CardDescription>
                                    {sessions && sessions.length > 0
                                        ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} • ${completedCount} completed`
                                        : 'No interviews yet'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {!sessions || sessions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm space-y-3">
                                        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                            <Play className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <p className="font-medium text-slate-600 dark:text-slate-300">Ready to practice?</p>
                                        <p className="text-xs text-slate-400 max-w-xs mx-auto">Start your first AI-powered mock interview to prepare for the real thing.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {sessions.map((session: any) => (
                                            <Link
                                                key={session.id}
                                                href={session.status === 'completed' ? `/dashboard/interview/${session.id}/feedback` : `/dashboard/interview/${session.id}`}
                                                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                                            >
                                                <div>
                                                    <div className="font-medium capitalize text-sm text-slate-800 dark:text-slate-200">
                                                        {session.interview_type.replace('_', ' ')}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                                        {session.status === 'completed' ? (
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Clock className="h-3 w-3 text-yellow-500" />
                                                        )}
                                                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                                        {session.overall_score && (
                                                            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">{session.overall_score}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-3 border-t">
                                    <StartInterviewButton applicationId={app.id} variant="outline" className="w-full" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Application Summary Stats */}
                        {app.match_score && (
                            <Card className="border-slate-200/60 dark:border-slate-700/50 shadow-lg">
                                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-800/30">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-blue-500" /> Application Summary
                                    </CardTitle>
                                    <CardDescription className="text-xs">At a glance view of your compatibility and progress.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-4">
                                    {/* Match Score */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">CV &harr; Job Match</span>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{app.match_score}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                                                style={{ width: `${app.match_score}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1.5">How well your resume fits the job requirements.</p>
                                    </div>

                                    <div className="pt-3 border-t grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Practice Interviews</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{sessions?.length || 0}</p>
                                        </div>
                                        {avgScore && (
                                            <div>
                                                <p className="text-xs text-slate-500">Average Score</p>
                                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{avgScore}%</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
