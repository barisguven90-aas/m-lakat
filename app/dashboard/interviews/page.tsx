"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Eye, MessageSquare, Plus, Loader2, ArrowRight, Clock, CheckCircle, Mic } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export default function InterviewsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchSessions() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('interview_sessions')
                    .select('*, applications(job_title, job_company)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) console.error(error);
                setSessions(data || []);
            } finally {
                setLoading(false);
            }
        }
        fetchSessions();
    }, []);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Interview History</h2>
                    <p className="text-muted-foreground mt-1">Review your past performance and continue active simulations.</p>
                </div>
                <Link href="/dashboard/applications">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Interview
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center p-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm text-muted-foreground">Loading history...</span>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/10">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-7 w-7 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No interviews yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                        Start your first mock interview by selecting an application and clicking &quot;Start Interview&quot;.
                    </p>
                    <Link href="/dashboard/applications/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Application
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => {
                        const isActive = session.status === 'active' || session.status === 'in_progress';
                        const isCompleted = session.status === 'completed';
                        const isVoice = session.config?.mode === 'voice';
                        const interviewPath = isVoice
                            ? `/dashboard/interview/voice/${session.id}`
                            : `/dashboard/interview/${session.id}`;

                        return (
                            <div
                                key={session.id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200 gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl shadow-sm flex-shrink-0">
                                        {session.applications?.job_company?.charAt(0)?.toUpperCase() || 'I'}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-base leading-tight">{session.applications?.job_title || 'Interview Session'}</p>
                                        <p className="text-sm text-muted-foreground">{session.applications?.job_company || 'Unknown Company'}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{format(new Date(session.created_at), 'PPP')}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:flex-shrink-0">
                                    <Badge variant="outline" className="capitalize text-xs">
                                        {session.interview_type?.replace('_', ' ') || 'general'}
                                    </Badge>

                                    {isVoice && (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 border-0 flex items-center gap-1">
                                            <Mic className="h-3 w-3" /> Voice
                                        </Badge>
                                    )}

                                    {isCompleted ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Completed
                                        </Badge>
                                    ) : isActive ? (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-0 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> In Progress
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="capitalize">{session.status}</Badge>
                                    )}

                                    {isActive ? (
                                        <Link href={interviewPath}>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                <PlayCircle className="mr-1.5 h-4 w-4" /> Continue
                                            </Button>
                                        </Link>
                                    ) : isCompleted ? (
                                        <Link href={`/dashboard/interview/${session.id}/feedback`}>
                                            <Button size="sm" variant="outline">
                                                <Eye className="mr-1.5 h-4 w-4" /> View Report
                                            </Button>
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
