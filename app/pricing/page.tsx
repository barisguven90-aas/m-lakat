import Link from 'next/link';
import { BrainCircuit, Check, ArrowRight, Zap, Shield, History, MessageSquare, Star, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { headers } from 'next/headers';

export const metadata = {
    title: 'Pricing — Intervio',
    description: 'Start free with 2 interviews/month. Upgrade to Intervio Pro for unlimited practice, detailed scoring, and interview history.',
};

// Detect Turkey by Vercel's geo header
async function detectRegion(): Promise<'TR' | 'GLOBAL'> {
    try {
        const h = await headers();
        const country = h.get('x-vercel-ip-country') || '';
        return country.toUpperCase() === 'TR' ? 'TR' : 'GLOBAL';
    } catch {
        return 'GLOBAL';
    }
}

const FREE_FEATURES = [
    { text: '2 interviews per month', icon: Zap },
    { text: 'Interview Score (0–100)', icon: Star },
    { text: 'Hire Probability Score', icon: Shield },
    { text: 'Standard AI feedback', icon: MessageSquare },
    { text: 'Voice & text interviews', icon: Globe },
];

const PRO_FEATURES = [
    { text: 'Unlimited interviews', icon: Zap, highlight: true },
    { text: 'Detailed 5-dimension scoring', icon: Star, highlight: true },
    { text: 'Hire probability analysis', icon: Shield },
    { text: 'Advanced AI feedback', icon: MessageSquare },
    { text: 'Interview history & reports', icon: History, highlight: true },
    { text: 'Voice & text interviews', icon: Globe },
    { text: 'Priority support', icon: Shield },
    { text: '6 languages supported', icon: Globe },
];

export default async function PricingPage() {
    const region = await detectRegion();
    const isTR = region === 'TR';

    const prices = {
        monthly: isTR ? '₺149' : '$12',
        yearly: isTR ? '₺899' : '$79',
        yearlySavings: isTR ? '₺889' : '$65',
    };

    return (
        <div className="min-h-screen bg-[#050505] text-neutral-50">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[40%] h-[50%] bg-indigo-900/8 blur-[120px] rounded-full" />
            </div>

            {/* Nav */}
            <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                            <BrainCircuit className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="font-bold text-lg text-white">Intervio</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">Log In</Link>
                        <Button asChild className="bg-white text-black hover:bg-neutral-200 rounded-full px-5 h-9 text-sm font-semibold">
                            <Link href="/signup">Get Started Free</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 pt-28 pb-24 px-6">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-5">
                        <Globe className="h-3.5 w-3.5" />
                        {isTR ? 'Türkiye fiyatlandırması uygulanıyor 🇹🇷' : 'International pricing applied'}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
                        Simple, honest pricing.
                    </h1>
                    <p className="text-neutral-400 text-lg">
                        Start free. Upgrade when you need more.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">

                    {/* Free Plan */}
                    <div className="relative rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm p-8 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-1">Free</h2>
                            <p className="text-neutral-500 text-sm">Perfect to get started</p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">$0</span>
                                <span className="text-neutral-500 text-sm">/forever</span>
                            </div>
                            <p className="text-emerald-400 text-sm font-medium mt-1">No credit card needed</p>
                        </div>

                        <ul className="space-y-3 flex-1 mb-8">
                            {FREE_FEATURES.map(f => (
                                <li key={f.text} className="flex items-center gap-3 text-sm text-neutral-300">
                                    <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <Check className="h-3 w-3 text-slate-400" />
                                    </div>
                                    {f.text}
                                </li>
                            ))}
                        </ul>

                        <Button asChild variant="outline" className="w-full border-neutral-700 text-white hover:bg-neutral-800 bg-transparent rounded-xl h-12">
                            <Link href="/signup">Get Started Free</Link>
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 backdrop-blur-sm p-8 flex flex-col shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                        {/* Popular badge */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                            MOST POPULAR
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-1">Pro</h2>
                            <p className="text-neutral-400 text-sm">For serious job seekers</p>
                        </div>

                        {/* Pricing toggle area */}
                        <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">{prices.monthly}</span>
                                        <span className="text-neutral-400 text-sm">/month</span>
                                    </div>
                                    <p className="text-neutral-500 text-xs">Billed monthly</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-neutral-600 text-xs">or</span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-baseline gap-1 justify-end">
                                        <span className="text-3xl font-black text-white">{prices.yearly}</span>
                                        <span className="text-neutral-400 text-sm">/year</span>
                                    </div>
                                    <p className="text-emerald-400 text-xs font-medium">Save {prices.yearlySavings}</p>
                                </div>
                            </div>
                        </div>

                        <ul className="space-y-3 flex-1 mb-8">
                            {PRO_FEATURES.map(f => (
                                <li key={f.text} className="flex items-center gap-3 text-sm">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.highlight ? 'bg-blue-600/30 border border-blue-500/40' : 'bg-slate-800'}`}>
                                        <Check className={`h-3 w-3 ${f.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                                    </div>
                                    <span className={f.highlight ? 'text-white font-medium' : 'text-neutral-300'}>{f.text}</span>
                                </li>
                            ))}
                        </ul>

                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            <Link href="/signup">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>

                        <p className="text-neutral-600 text-xs text-center mt-3">
                            {isTR ? 'İptal etmek için kredi kartı üzerinden 1 tıklama yeterli' : 'Cancel anytime. No questions asked.'}
                        </p>
                    </div>
                </div>

                {/* FAQ / Trust */}
                <div className="max-w-2xl mx-auto mt-20 text-center">
                    <h3 className="text-white font-bold text-2xl mb-8">Common questions</h3>
                    <div className="space-y-4 text-left">
                        {[
                            {
                                q: 'What happens after my 2 free interviews?',
                                a: "You'll see an upgrade prompt. Your past results and history are saved. Upgrade anytime to continue practicing."
                            },
                            {
                                q: 'Can I cancel my Pro subscription?',
                                a: 'Yes, anytime. No contracts, no commitments. When you cancel, you keep Pro access until the end of your billing period.'
                            },
                            {
                                q: isTR ? 'Türkiye fiyatları mı geçerli?' : 'Are prices in my local currency?',
                                a: isTR
                                    ? 'Evet! Türkiye\'de bulunduğunuz için fiyatlarınız otomatik olarak Türk Lirası (₺) olarak görüntülenmektedir.'
                                    : 'Prices shown in USD for international users. Turkish users automatically see TRY prices.'
                            },
                        ].map(item => (
                            <div key={item.q} className="bg-white/3 border border-white/8 rounded-xl p-5">
                                <p className="text-white font-medium mb-2 text-sm">{item.q}</p>
                                <p className="text-neutral-400 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
