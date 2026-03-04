"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ActivityChartProps {
    sessions: Array<{
        created_at: string;
        status: string;
        session_feedback?: Array<{ job_match_score?: number; star_methodology_score?: number; clarity_score?: number }>;
    }>;
}

export function ActivityChart({ sessions }: ActivityChartProps) {
    const chartData = useMemo(() => {
        // Last 30 days  
        const days: Record<string, { date: string; interviews: number; avgScore: number; scores: number[] }> = {};
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            days[key] = { date: label, interviews: 0, avgScore: 0, scores: [] };
        }

        sessions.forEach(s => {
            const key = new Date(s.created_at).toISOString().split('T')[0];
            if (days[key]) {
                days[key].interviews++;
                const fb = s.session_feedback?.[0];
                if (fb?.job_match_score) {
                    const avg = Math.round(((fb.job_match_score || 0) + (fb.star_methodology_score || 0) + (fb.clarity_score || 0)) / 3);
                    days[key].scores.push(avg);
                }
            }
        });

        return Object.values(days).map(d => ({
            ...d,
            avgScore: d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : null,
        }));
    }, [sessions]);

    if (sessions.length === 0) return null;

    return (
        <div className="w-full">
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#e2e8f0',
                                backdropFilter: 'blur(8px)',
                            }}
                            formatter={(value: any, name?: string) => {
                                if (name === 'interviews') return [value, 'Interviews'];
                                if (name === 'avgScore') return [value ? `${value}%` : '\u2014', 'Avg Score'];
                                return [value, name || ''];
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="interviews"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#colorInterviews)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="avgScore"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorScore)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] text-muted-foreground font-medium">Interviews</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground font-medium">Avg Score</span>
                </div>
            </div>
        </div>
    );
}
