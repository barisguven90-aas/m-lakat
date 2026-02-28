"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchApplications() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('applications')
                    .select('*')
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
        } catch (error) {
            console.error("Failed to delete application", error);
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
                    <p className="text-muted-foreground">Manage your job applications and preparing materials.</p>
                </div>
                <Link href="/dashboard/applications/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Application
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-40 bg-muted/20" />
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 border rounded-lg bg-muted/10">
                    <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                    <p className="text-muted-foreground mb-6">Start by creating your first application package.</p>
                    <Link href="/dashboard/applications/new">
                        <Button>Create Application</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <Card key={app.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="line-clamp-1" title={app.job_title}>{app.job_title}</CardTitle>
                                <CardDescription className="line-clamp-1">{app.job_company}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-sm text-muted-foreground mb-4">
                                    added on {format(new Date(app.created_at), 'PPP')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.match_score >= 80 ? 'bg-green-100 text-green-700' :
                                            app.match_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        Match: {app.match_score || '?'}%
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-4">
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Link href={`/dashboard/applications/${app.id}`}>
                                    <Button size="sm" variant="outline">
                                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
