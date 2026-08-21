"use client";

import Link from "next/link";
import { BrainCircuit, Sparkles, Target, Mic, FileText, ArrowRight, CheckCircle2, Zap, PlayCircle, BarChart3, Star, Bot, TrendingUp, Building2, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/dashboard/LanguageToggle";
import { DemoSection } from "@/components/landing/DemoSection";
import { useLanguageStore } from "@/store/useLanguageStore";
import Image from "next/image";

export function LandingContent() {
  const { t, language } = useLanguageStore();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Light, friendly background accents */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] bg-blue-100/60 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[20%] right-[-10%] w-[70vw] sm:w-[40vw] h-[90vw] sm:h-[60vw] bg-purple-100/60 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-20%] left-[15%] w-[90vw] sm:w-[60vw] h-[80vw] sm:h-[50vw] bg-rose-100/60 rounded-full blur-3xl opacity-50" />
      </div>

      <nav className="fixed top-0 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image src="/logo.png" alt="Intervio Logo" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl shadow-sm" />
            <span translate="no" className="notranslate font-bold text-lg sm:text-xl tracking-tight text-slate-800">Intervio</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <LanguageToggle />
            <Link href="/pricing" className="hidden sm:inline-block text-xs sm:text-sm font-medium text-slate-500 hover:text-primary transition-colors">
              {t('nav_pricing')}
            </Link>
            <Link href="/login" className="text-xs sm:text-sm font-medium text-slate-500 hover:text-primary transition-colors">
              {t('nav_login')}
            </Link>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-blue-700 rounded-full px-3 sm:px-5 h-8 sm:h-9 text-xs sm:text-sm font-semibold transition-all shadow-md">
              <Link href="/signup">{t('get_started')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 sm:pt-32 lg:pt-40">
        
        {/* === Hero Section === */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 mb-16 sm:mb-24 lg:mb-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm mb-4 sm:mb-6 font-medium shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 suppressHydrationWarning className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.1] text-slate-900">
              {t('hero_h1_1')}{" "}
              <br className="sm:hidden" />
              {t('hero_h1_2')}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('hero_h1_3')} AI</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium px-2 lg:px-0">
              {t('hero_subtext')}
            </p>

            <div className="w-full">
              <DemoSection />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('trust_1')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('trust_2')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('trust_3')}</span>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-3xl scale-90" />
              <Image src="/mascot.png" alt="Coach Cappy - The Capybara" width={420} height={420} className="object-contain relative z-10 drop-shadow-2xl" priority />
            </div>
          </div>
        </div>

        {/* === Interactive App Preview Section === */}
        <div className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-32 lg:mb-40">
          <div className="max-w-5xl mx-auto rounded-3xl bg-white p-2 ring-1 ring-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group">
            
            <div className="rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 relative">
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-slate-200 hidden md:flex items-center gap-4 shadow-lg animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">STAR Method</p>
                  <p className="text-xs font-semibold text-emerald-600">Excellent Example</p>
                </div>
              </div>

              <div className="p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[450px] relative">
                <div className="flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white shadow-xl mb-6 sm:mb-8 relative border-4 border-blue-50">
                   <Image src="/mascot.png" alt="Mascot" width={70} height={70} className="object-contain" />
                </div>
                <div className="text-center max-w-lg px-4">
                  <div className="inline-block px-4 py-2 rounded-2xl bg-blue-100 text-blue-800 text-sm sm:text-base font-medium mb-4 sm:mb-6 shadow-sm border border-blue-200">
                    &quot;{t('mockup_speaking')}&quot;
                  </div>
                  <h3 className="text-lg sm:text-3xl font-bold text-slate-800 mb-2 leading-tight">{t('mockup_question')}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === How it Works Section === */}
        <div className="bg-white border-y border-slate-200 py-16 sm:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-10 sm:mb-16">
               <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest mb-4">{t('how_it_works_badge')}</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">{t('how_it_works_title')}</h2>
              <p className="text-slate-600 text-base sm:text-lg px-4 max-w-2xl mx-auto font-medium">{t('how_it_works_sub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group hover:shadow-lg transition-all hover:-translate-y-1">
                 <div className="h-56 bg-blue-100/50 p-6 flex flex-col items-center justify-center relative">
                    <div className="w-[85%] bg-white rounded-2xl border border-slate-100 p-5 shadow-sm z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Image src="/mascot.png" alt="Mascot" width={24} height={24} />
                            </div>
                            <div className="text-sm text-slate-700 font-bold">Cappy is speaking...</div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-slate-100 rounded-full" />
                            <div className="h-2 w-4/5 bg-slate-200 rounded-full animate-pulse" />
                        </div>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-white">
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{t('step1_title')}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{t('step1_desc')}</p>
                 </div>
              </div>

              <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group hover:shadow-lg transition-all hover:-translate-y-1">
                 <div className="h-56 bg-purple-100/50 p-6 flex items-center justify-center relative">
                    <div className="w-[90%] bg-white rounded-2xl border border-slate-100 p-5 shadow-sm z-10">
                        <div className="text-sm text-purple-600 font-bold mb-3 flex items-center gap-2">
                          <Bot className="h-4 w-4" /> Analyzing Answer...
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed font-semibold">"<span className="text-purple-700 bg-purple-100 px-1 rounded">Can you share a situation</span> where you had to adapt quickly?"</div>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-white">
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{t('step2_title')}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{t('step2_desc')}</p>
                 </div>
              </div>

              <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group hover:shadow-lg transition-all hover:-translate-y-1">
                 <div className="h-56 bg-emerald-100/50 p-6 flex items-center justify-center relative gap-6">
                    <div className="bg-white flex flex-col items-center gap-3 rounded-2xl border border-slate-100 p-5 z-10 shadow-sm group-hover:-translate-y-1 group-hover:-rotate-3 transition-transform">
                         <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-1"><Target className="h-6 w-6 text-emerald-600" /></div>
                         <div className="h-1.5 w-12 bg-slate-200 rounded-full mb-1" />
                         <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Target Job</span>
                    </div>
                    <div className="bg-white flex flex-col items-center gap-3 rounded-2xl border border-slate-100 p-5 z-10 shadow-sm group-hover:-translate-y-1 group-hover:rotate-3 transition-transform">
                         <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-1"><FileText className="h-6 w-6 text-blue-600" /></div>
                         <div className="h-1.5 w-12 bg-slate-200 rounded-full mb-1" />
                         <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Your CV</span>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-white">
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{t('step3_title')}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{t('step3_desc')}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Final CTA === */}
        <div className="py-20 sm:py-32 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8 text-slate-900">{t('cta_title')}</h2>
            <Button asChild size="lg" className="h-14 sm:h-16 px-10 sm:px-12 text-base sm:text-lg font-bold bg-primary hover:bg-blue-700 text-white rounded-full shadow-xl transition-all hover:scale-105 active:scale-95">
              <Link href="/signup">
                {t('cta_button')}
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-12 px-6 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 mb-8 font-medium">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Intervio Logo" width={24} height={24} className="h-6 w-6 object-contain rounded" />
                <span translate="no" className="notranslate">© {new Date().getFullYear()} Intervio AI. All rights reserved.</span>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-primary transition-colors">{t('footer_privacy')}</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">{t('footer_terms')}</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
