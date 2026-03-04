"use client";

import { useMemo } from "react";
import { Trophy, Flame, Target, Medal, Star, Zap, Award, Clock } from "lucide-react";

interface AchievementsPanelProps {
    totalInterviews: number;
    completedInterviews: number;
    avgScore: number;
    weeklyInterviews: number;
    allSessions: any[];
}

interface Achievement {
    id: string;
    label: string;
    description: string;
    icon: any;
    unlocked: boolean;
    color: string;
}

function getStreak(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0;

    const dates = sessions
        .map(s => {
            const d = new Date(s.created_at);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
        .filter((v, i, a) => a.indexOf(v) === i) // unique dates
        .sort()
        .reverse();

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 60; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

        if (dates.includes(key)) {
            streak++;
        } else if (i > 0) {
            break; // streak broken
        }
        // if i === 0 and no match, keep checking yesterday
    }

    return streak;
}

export function AchievementsPanel({ totalInterviews, completedInterviews, avgScore, weeklyInterviews, allSessions }: AchievementsPanelProps) {
    const streak = useMemo(() => getStreak(allSessions), [allSessions]);

    const achievements: Achievement[] = useMemo(() => [
        {
            id: 'first_interview',
            label: 'First Steps',
            description: 'Complete your first interview',
            icon: Star,
            unlocked: completedInterviews >= 1,
            color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        },
        {
            id: 'five_interviews',
            label: 'Getting Warmed Up',
            description: 'Complete 5 interviews',
            icon: Zap,
            unlocked: completedInterviews >= 5,
            color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        },
        {
            id: 'ten_interviews',
            label: 'Dedicated Learner',
            description: 'Complete 10 interviews',
            icon: Trophy,
            unlocked: completedInterviews >= 10,
            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            id: 'high_score',
            label: 'High Achiever',
            description: 'Reach 80+ average score',
            icon: Award,
            unlocked: avgScore >= 80,
            color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
        },
        {
            id: 'streak_3',
            label: '3-Day Streak',
            description: 'Practice 3 days in a row',
            icon: Flame,
            unlocked: streak >= 3,
            color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        },
        {
            id: 'weekly_goal',
            label: 'Goal Crusher',
            description: 'Complete weekly goal of 5',
            icon: Target,
            unlocked: weeklyInterviews >= 5,
            color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        },
    ], [completedInterviews, avgScore, streak, weeklyInterviews]);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="space-y-4">
            {/* Streak Counter (Feature 10) */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <Medal className="h-4 w-4 text-amber-500" />
                    Achievements
                    <span className="text-[10px] font-medium text-muted-foreground">
                        {unlockedCount}/{achievements.length}
                    </span>
                </h3>
                {streak > 0 && (
                    <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                        <Flame className="h-3.5 w-3.5" />
                        {streak} day streak 🔥
                    </div>
                )}
            </div>

            {/* Achievement Badges (Feature 9) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {achievements.map(a => {
                    const Icon = a.icon;
                    return (
                        <div
                            key={a.id}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${a.unlocked
                                ? `${a.color} border-current/20 shadow-sm`
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-40 grayscale'
                                }`}
                            title={a.description}
                        >
                            <Icon className={`h-5 w-5 ${a.unlocked ? '' : 'text-slate-400'}`} />
                            <span className="text-[10px] font-bold leading-tight">{a.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
