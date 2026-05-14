"use client"

import { LoginForm } from "@/components/auth/LoginForm"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { FadeText } from "@/components/ui/fade-text"
import { BorderBeam } from "@/components/ui/border-beam"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { BrainCircuit, Sparkles, Target, TrendingUp } from "lucide-react"
import { AnimatedAuthBackground } from "@/components/ui/animated-background"
import { useLanguageStore } from "@/store/useLanguageStore"
import React from "react"

export default function LoginPage() {
    const { language } = useLanguageStore()
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => setIsMounted(true), [])
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-neutral-950">
            {/* Animated 21st.dev style particle background */}
            <AnimatedAuthBackground />

            {/* Feature pills — top */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 z-10">
                {(isMounted && language === 'tr' ? [
                    { icon: Target, label: "İşe Özel Sorular" },
                    { icon: Sparkles, label: "Yapay Zeka Geri Bildirimi" },
                    { icon: TrendingUp, label: "Gerçek Zamanlı Puanlama" }
                ] : [
                    { icon: Target, label: "Job-Specific Questions" },
                    { icon: Sparkles, label: "AI Feedback" },
                    { icon: TrendingUp, label: "Real-Time Scoring" }
                ]).map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs backdrop-blur-sm">
                        <Icon className="h-3 w-3 text-blue-400" />
                        {label}
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="Intervio Logo" className="h-16 w-16 object-contain rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)] mb-3" />
                    <div translate="no" className="notranslate">
                        <FadeText
                            text="Intervio"
                            className="text-2xl font-bold tracking-tight text-white"
                            direction="down"
                        />
                    </div>
                    <p className="text-neutral-500 text-sm mt-1">{isMounted && language === 'tr' ? "Yapay Zeka Destekli Mülakat Pratiği Platformu" : "AI-Powered Mock Interview Platform"}</p>
                </div>

                <Card className="w-full bg-neutral-900/60 backdrop-blur-xl border-neutral-800 shadow-2xl relative overflow-hidden">
                    <BorderBeam size={250} duration={12} delay={9} />

                    <CardHeader className="pb-2 text-center">
                        <CardDescription className="text-neutral-400">
                            {isMounted && language === 'tr' ? "Pratiğe başlamak için giriş yapın" : "Sign in to start your practice session"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-2">
                        <LoginForm />

                        <div className="flex items-center gap-4">
                            <Separator className="flex-1 bg-neutral-800" />
                            <span className="text-xs text-neutral-600 font-medium">{isMounted && language === 'tr' ? 'VEYA' : 'OR'}</span>
                            <Separator className="flex-1 bg-neutral-800" />
                        </div>

                        <GoogleAuthButton text={isMounted && language === 'tr' ? "Google ile Giriş Yap" : "Sign in with Google"} />
                    </CardContent>

                    <CardFooter className="flex justify-center pb-6">
                        <p className="text-sm text-neutral-500">
                            {isMounted && language === 'tr' ? "Hesabınız yok mu?" : "Don't have an account?"}{" "}
                            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                {isMounted && language === 'tr' ? "Ücretsiz oluşturun" : "Create one free"}
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <p className="text-center text-neutral-700 text-xs mt-4">
                    {isMounted && language === 'tr' ? "Google/Amazon/Startup tarzı sorularla pratik yapın • Türkçe ve İngilizce" : "Practice with Google/Amazon/Startup style questions • Turkish & English"}
                </p>
            </div>
        </div>
    )
}
