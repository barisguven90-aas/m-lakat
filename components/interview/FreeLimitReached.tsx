"use client";

import { Zap, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FreeLimitReachedProps {
    used?: number;
    limit?: number;
}

export function FreeLimitReached({ used = 2, limit = 2 }: FreeLimitReachedProps) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-amber-400" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    You&apos;ve used your {limit} free interviews this month.
                </h1>
                <p className="text-neutral-400 mb-8 leading-relaxed">
                    Upgrade to <span className="text-white font-semibold">Intervio Pro</span> for unlimited practice, detailed scoring, and interview history.
                </p>

                <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
                    {[
                        'Unlimited interviews every month',
                        'Detailed 5-dimension scoring',
                        'Hire probability analysis',
                        'Interview history & reports',
                        'Advanced AI feedback',
                    ].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm text-neutral-300">
                            <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            {f}
                        </div>
                    ))}
                </div>

                <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <Link href="/pricing">
                        Upgrade to Pro
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>

                <p className="text-neutral-600 text-xs mt-4">
                    Or wait until next month for your free interviews to reset.
                </p>
            </div>
        </div>
    );
}
