"use client"

import { SignUpForm } from "@/components/auth/SignUpForm"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { FadeText } from "@/components/ui/fade-text"
import { BorderBeam } from "@/components/ui/border-beam"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { BrainCircuit, CheckCircle } from "lucide-react"
import { AnimatedAuthBackground } from "@/components/ui/animated-background"

export default function SignUpPage() {
    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-neutral-950">
            {/* Animated 21st.dev style particle background */}
            <AnimatedAuthBackground />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
                        <BrainCircuit className="h-7 w-7 text-emerald-400" />
                    </div>
                    <FadeText
                        text="Start Your Journey"
                        className="text-2xl font-bold tracking-tight text-white"
                        direction="down"
                    />
                    <p className="text-neutral-500 text-sm mt-1">Free to start · AI-Powered Interview Coach</p>
                </div>

                {/* Benefits */}
                <div className="flex flex-col gap-1.5 mb-5">
                    {[
                        "Personalized questions based on your CV & job",
                        "Company-style interviews: Google, Amazon, Startup",
                        "6 global languages (EN, TR, ES, FR, DE, ZH)"
                    ].map(text => (
                        <div key={text} className="flex items-center gap-2 text-xs text-neutral-400">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            {text}
                        </div>
                    ))}
                </div>

                <Card className="w-full bg-neutral-900/60 backdrop-blur-xl border-neutral-800 shadow-2xl relative overflow-hidden">
                    <BorderBeam size={250} duration={12} delay={9} colorFrom="#10b981" colorTo="#3b82f6" />

                    <CardHeader className="pb-2 text-center">
                        <CardDescription className="text-neutral-400">
                            Create your free account to begin
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-2">
                        <SignUpForm />

                        <div className="flex items-center gap-4">
                            <Separator className="flex-1 bg-neutral-800" />
                            <span className="text-xs text-neutral-600 font-medium">OR</span>
                            <Separator className="flex-1 bg-neutral-800" />
                        </div>

                        <GoogleAuthButton />
                    </CardContent>

                    <CardFooter className="flex justify-center pb-6">
                        <p className="text-sm text-neutral-500">
                            Already have an account?{" "}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
