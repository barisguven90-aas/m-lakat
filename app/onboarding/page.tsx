"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Target, Zap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/onboarding/complete', { method: 'POST' });
            router.push('/dashboard');
        } catch (error) {
            console.error("Error completing onboarding", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden text-neutral-50 px-6">

            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-2xl w-full text-center space-y-8">

                {/* Icon Header */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-8 border border-white/10">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Intervio</span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
                        Your personal AI interview coach. Prepare for the toughest questions, get real-time feedback, and land your dream job with confidence.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 pb-4 text-left">
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm">
                        <Target className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="font-semibold text-lg text-white mb-2">Role-Specific</h3>
                        <p className="text-neutral-400 text-sm">Tailored questions for your exact industry and seniority level.</p>
                    </div>
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm">
                        <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                        <h3 className="font-semibold text-lg text-white mb-2">Instant Feedback</h3>
                        <p className="text-neutral-400 text-sm">Actionable advice on your answers right after the interview.</p>
                    </div>
                    <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm">
                        <Briefcase className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="font-semibold text-lg text-white mb-2">Build Confidence</h3>
                        <p className="text-neutral-400 text-sm">Practice in a stress-free environment until you're perfect.</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-6">
                    <Button
                        size="lg"
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="h-14 px-8 text-lg font-semibold bg-white text-neutral-950 hover:bg-neutral-200 shadow-xl shadow-white/10 rounded-full transition-all group"
                    >
                        {isLoading ? "Preparing Dashboard..." : "Get Started Now"}
                        {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </div>

            </div>
        </div>
    );
}
