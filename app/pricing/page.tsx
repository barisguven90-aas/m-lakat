import Link from "next/link";
import Image from "next/image";
import { BrainCircuit, CheckCircle2, Rocket, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Fiyatlandırma | Intervio AI — Ücretsiz Başla",
    description: "Intervio ile ayda 2 mülakat ücretsiz. Pro planla sınırsız pratik, detaylı feedback ve ilerleme takibi. Kredi kartı gerekmez.",
    alternates: {
        canonical: 'https://intervioai.com/pricing',
    },
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-neutral-50 selection:bg-blue-500/30 overflow-x-hidden flex flex-col">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(30,58,138,0.1)_0%,transparent_70%)] rounded-full" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[60%] bg-[radial-gradient(circle,rgba(49,46,129,0.1)_0%,transparent_70%)] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50 transition-all duration-300">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Intervio Logo" width={40} height={40} className="h-8 w-8 object-contain rounded scale-110" />
            <span translate="no" className="notranslate font-bold text-lg tracking-tight text-white">Intervio</span>
                    </Link>
                    <div className="flex items-center gap-5">
                        <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                            Log In
                        </Link>
                        <Button asChild className="bg-white text-black hover:bg-neutral-200 rounded-full px-5 h-9 text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex-grow pt-32 pb-24 lg:pt-40 lg:pb-32 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">
                            Simple, transparent plans
                        </h1>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                            Start practicing for free today. Upgrade when you're ready for unlimited access and advanced AI features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Tier */}
                        <div className="relative p-8 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-white/20 transition-colors flex flex-col h-full overflow-hidden">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">Free</h3>
                                <p className="text-neutral-400 text-sm">Perfect for testing the waters and preparing for a specific role.</p>
                            </div>

                            <div className="mb-8 flex-grow">
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">1 Text Interview / month</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">1 Voice Interview / month</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">Basic AI scoring & feedback</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">Bilingual Support (EN / TR)</span>
                                    </li>
                                </ul>
                            </div>

                            <Button asChild className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 text-base font-semibold">
                                <Link href="/signup">Start for Free</Link>
                            </Button>
                        </div>

                        {/* Pro Tier */}
                        <div className="relative p-8 rounded-3xl bg-[#0a0f1c] border border-blue-500/30 hover:border-blue-500/50 transition-colors shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col h-full overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] rounded-full" />

                            <div className="mb-8 relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Rocket className="h-5 w-5 text-blue-400" />
                                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Pro</h3>
                                    </div>
                                    <p className="text-blue-200/70 text-sm">Unlock your full potential with continuous practice and tracking.</p>
                                </div>
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                                    Coming Soon
                                </span>
                            </div>

                            <div className="mb-8 flex-grow relative z-10">
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-200 font-medium">Unlimited Interviews</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">Hyper-detailed feedback summaries</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">Interview history & progress tracking</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">Custom company personas (Big Tech, Startups)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">Shareable result cards</span>
                                    </li>
                                </ul>
                            </div>

                            <Button asChild className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none text-base font-semibold shadow-lg shadow-blue-500/25">
                                <Link href="/signup">Join the Waitlist</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6 mt-auto">
                <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Intervio Logo" width={24} height={24} className="h-6 w-6 object-contain rounded opacity-70" />
              <span>© {new Date().getFullYear()} Intervio AI. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
