"use client"

import { LoginForm } from "@/components/auth/LoginForm"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { FadeText } from "@/components/ui/fade-text"
import { BorderBeam } from "@/components/ui/border-beam"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { BrainCircuit, Sparkles, Target, TrendingUp } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-neutral-950">
            {/* Animated gradient background — no external image dependency */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59,130,246,0.15), transparent), radial-gradient(ellipse 60% 60% at 80% 100%, rgba(99,102,241,0.10), transparent)'
                }} />
                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
                {/* Decorative floating blobs */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
            </div>

            {/* Feature pills — top */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                {[
                    { icon: Target, label: "Job-Specific Questions" },
                    { icon: Sparkles, label: "AI Feedback" },
                    { icon: TrendingUp, label: "Real-Time Scoring" }
                ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs backdrop-blur-sm">
                        <Icon className="h-3 w-3 text-blue-400" />
                        {label}
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/10">
                        <BrainCircuit className="h-7 w-7 text-blue-400" />
                    </div>
                    <FadeText
                        text="Interview Coach"
                        className="text-2xl font-bold tracking-tight text-white"
                        direction="down"
                    />
                    <p className="text-neutral-500 text-sm mt-1">AI-Powered Mock Interview Platform</p>
                </div>

                <Card className="w-full bg-neutral-900/60 backdrop-blur-xl border-neutral-800 shadow-2xl relative overflow-hidden">
                    <BorderBeam size={250} duration={12} delay={9} />

                    <CardHeader className="pb-2 text-center">
                        <CardDescription className="text-neutral-400">
                            Sign in to start your practice session
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-2">
                        <LoginForm />

                        <div className="flex items-center gap-4">
                            <Separator className="flex-1 bg-neutral-800" />
                            <span className="text-xs text-neutral-600 font-medium">OR</span>
                            <Separator className="flex-1 bg-neutral-800" />
                        </div>

                        <GoogleAuthButton />
                    </CardContent>

                    <CardFooter className="flex justify-center pb-6">
                        <p className="text-sm text-neutral-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Create one free
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-center text-neutral-700 text-xs mt-4">
                    Practice with Google/Amazon/Startup style questions • Turkish & English
                </p>
            </div>
        </div>
    )
}
