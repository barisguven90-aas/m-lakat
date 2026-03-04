"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Trash2, ArrowRight, Loader2, MessageSquare, CheckCircle,
    Clock, XCircle, Briefcase, StickyNote, Send, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
    interviewing: { label: 'Interviewing', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: MessageSquare },
    offered: { label: 'Offered', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const supabase = createClient();

    useEffect(() => {
        async function fetchApplications() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('applications')
                    .select('*, interview_sessions(id, status, session_feedback(job_match_score))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) console.error(error);
                setApplications(data || []);
            } finally {
                setLoading(false);
            }
        }
        fetchApplications();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this application? This will also delete related interviews.")) return;
        try {
            await supabase.from('applications').delete().eq('id', id);
            setApplications(prev => prev.filter(a => a.id !== id));
            toast.success("Application deleted");
        } catch (error) {
            console.error("Failed to delete application", error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await supabase.from('applications').update({ status: newStatus }).eq('id', id);
            setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleSaveNote = async (id: string) => {
        try {
            await supabase.from('applications').update({ notes: noteText }).eq('id', id);
            setApplications(prev => prev.map(a => a.id === id ? { ...a, notes: noteText } : a));
            setEditingNoteId(null);
            toast.success("Note saved");
        } catch {
            toast.error("Failed to save note");
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
                    <p className="text-muted-foreground mt-1">Manage your job applications and track your progress.</p>
                </div>
                <Link href="/dashboard/applications/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Application
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm text-muted-foreground">Loading applications...</span>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/10">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="h-7 w-7 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No applications yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                        Start by creating your first application package to begin practicing interviews.
                    </p>
                    <Link href="/dashboard/applications/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Application
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {applications.map((app) => {
                        const sessions = app.interview_sessions || [];
                        const completedSessions = sessions.filter((s: any) => s.status === 'completed');
                        const totalSessions = sessions.length;
                        const avgScore = completedSessions.length > 0
                            ? Math.round(completedSessions.reduce((sum: number, s: any) => sum + (s.session_feedback?.[0]?.job_match_score || 0), 0) / completedSessions.length)
                            : null;
                        const statusConfig = STATUS_CONFIG[app.status || 'applied'] || STATUS_CONFIG.applied;
                        const StatusIcon = statusConfig.icon;

                        return (
                            <Card key={app.id} className="flex flex-col border-muted/60 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="line-clamp-1 text-base" title={app.job_title}>{app.job_title}</CardTitle>
                                            <CardDescription className="line-clamp-1 mt-0.5">{app.job_company}</CardDescription>
                                        </div>
                                        {/* Status Badge Dropdown (Feature 4) */}
                                        <div className="relative group/status shrink-0">
                                            <button className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${statusConfig.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig.label}
                                                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 hidden group-hover/status:block min-w-[140px]">
                                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                                                    const Icon = cfg.icon;
                                                    return (
                                                        <button
                                                            key={key}
                                                            onClick={() => handleStatusChange(app.id, key)}
                                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${app.status === key ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                                                        >
                                                            <Icon className="h-3.5 w-3.5" />
                                                            {cfg.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 space-y-3 pb-3">
                                    {/* Meta Info (Feature 3) */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <p className="text-lg font-bold">{totalSessions}</p>
                                            <p className="text-[10px] text-muted-foreground">Interviews</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <p className="text-lg font-bold">{avgScore !== null ? `${avgScore}%` : '—'}</p>
                                            <p className="text-[10px] text-muted-foreground">Avg Score</p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <p className={`text-lg font-bold ${app.match_score >= 70 ? 'text-emerald-600' : app.match_score >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                {app.match_score || '?'}%
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Match</p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>{format(new Date(app.created_at), 'PPP')}</span>
                                        <span>{formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
                                    </div>

                                    {/* Notes (Feature 5) */}
                                    {editingNoteId === app.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={noteText}
                                                onChange={e => setNoteText(e.target.value)}
                                                placeholder="Add a note..."
                                                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex gap-1.5 justify-end">
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                                                <Button size="sm" className="h-7 text-[10px]" onClick={() => handleSaveNote(app.id)}>Save</Button>
                                            </div>
                                        </div>
                                    ) : app.notes ? (
                                        <button
                                            onClick={() => { setEditingNoteId(app.id); setNoteText(app.notes || ''); }}
                                            className="w-full text-left text-[11px] text-slate-500 dark:text-slate-400 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors line-clamp-2"
                                        >
                                            <StickyNote className="h-3 w-3 inline mr-1 text-amber-500" />
                                            {app.notes}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { setEditingNoteId(app.id); setNoteText(''); }}
                                            className="w-full text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <StickyNote className="h-3 w-3" /> Add note...
                                        </button>
                                    )}
                                </CardContent>

                                <CardFooter className="flex justify-between border-t pt-3 pb-3 px-5">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Link href={`/dashboard/applications/${app.id}`}>
                                        <Button size="sm" variant="outline" className="text-xs h-8">
                                            View Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
