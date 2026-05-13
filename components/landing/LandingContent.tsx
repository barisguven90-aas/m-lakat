"use client";

import Link from "next/link";
import { BrainCircuit, Sparkles, Target, Mic, FileText, ArrowRight, CheckCircle2, Zap, PlayCircle, BarChart3, Star, Bot, TrendingUp, Building2, MonitorSmartphone } from "lucide-react";
import { AnimatedAuthBackground } from "@/components/ui/animated-background";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/dashboard/LanguageToggle";
import { DemoSection } from "@/components/landing/DemoSection";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useEffect, useState } from "react";
import Image from "next/image";

export function LandingContent() {
  const { t } = useLanguageStore();

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-50 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] bg-[radial-gradient(circle,rgba(30,58,138,0.15)_0%,transparent_70%)] rounded-full animate-float" />
        <div className="absolute top-[20%] right-[-10%] w-[70vw] sm:w-[40vw] h-[90vw] sm:h-[60vw] bg-[radial-gradient(circle,rgba(49,46,129,0.1)_0%,transparent_70%)] rounded-full animate-float-delayed" />
        <div className="absolute bottom-[-20%] left-[15%] w-[90vw] sm:w-[60vw] h-[80vw] sm:h-[50vw] bg-[radial-gradient(circle,rgba(88,28,135,0.15)_0%,transparent_70%)] rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image src="/logo.png" alt="Intervio Logo" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <span translate="no" className="notranslate font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Intervio</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <LanguageToggle />
            <Link href="/pricing" className="hidden sm:inline-block text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              {t('nav_pricing')}
            </Link>
            <Link href="/login" className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              {t('nav_login')}
            </Link>
            <Button asChild className="bg-white text-black hover:bg-neutral-200 rounded-full px-3 sm:px-5 h-8 sm:h-9 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Link href="/signup">{t('get_started')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 sm:pt-32 lg:pt-40">
        <AnimatedAuthBackground />
        
        {/* === Hero Section === */}
        <div className="container mx-auto max-w-5xl text-center px-4 sm:px-6 mb-16 sm:mb-24 lg:mb-32">
          <div className="animate-fade-in-up animation-delay-100 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm mb-4 sm:mb-6 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>{t('hero_badge')}</span>
          </div>

          <h1 className="animate-fade-in-up animation-delay-200 text-3xl sm:text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">
            {t('hero_h1_1')}{" "}
            <br className="sm:hidden" />
            {t('hero_h1_2')}{" "}
            <br />
            {t('hero_h1_3')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">AI</span>
          </h1>

          <p className="animate-fade-in-up animation-delay-300 text-sm sm:text-lg md:text-xl text-neutral-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light px-2">
            {t('hero_subtext')}
          </p>

          <div className="animate-fade-in-up animation-delay-400 w-full px-4 sm:px-0">
            <DemoSection />
          </div>

          <div className="animate-fade-in-up animation-delay-500 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-neutral-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" /> {t('trust_1')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" /> {t('trust_2')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" /> {t('trust_3')}</span>
          </div>
        </div>

        {/* === Interactive App Preview Section === */}
        <div className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-32 lg:mb-48">
          <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 p-1 ring-1 ring-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="rounded-xl bg-[#0a0a0a] overflow-hidden border border-white/5 relative">
              <div className="absolute top-10 right-10 bg-neutral-900/80 backdrop-blur-md rounded-lg p-4 border border-white/5 hidden lg:flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">STAR Method</p>
                  <p className="text-xs text-green-400">Excellent Example</p>
                </div>
              </div>

              <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[400px] bg-[url('/grid.svg')] bg-center relative">
                <div className="flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.5)] mb-6 sm:mb-8 relative">
                  <Bot className="h-7 w-7 sm:h-10 sm:w-10 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full ring-2 ring-blue-400 ring-offset-4 ring-offset-[#0a0a0a] animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                <div className="text-center max-w-md px-2">
                  <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neutral-800 text-neutral-300 text-xs sm:text-sm mb-3 sm:mb-4">
                    &quot;{t('mockup_speaking')}&quot;
                  </div>
                  <h3 className="text-base sm:text-2xl font-medium text-white mb-2 leading-tight">{t('mockup_question')}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Testimonials Section === */}
        <div className="pt-6 sm:pt-10 pb-12 sm:pb-20 mt-6 lg:mt-0 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2">{t('testimonials_title')}</h2>
              <p className="text-sm sm:text-base text-neutral-400">{t('testimonials_sub')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Star className="w-12 h-12 fill-white" /></div>
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}</div>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">"The AI interviewer felt incredibly realistic. The STAR method feedback specifically helped me land my dream role as a Senior Product Manager."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">AS</div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Alex S.</h4>
                    <p className="text-neutral-500 text-xs">Senior Product Manager</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Star className="w-12 h-12 fill-white" /></div>
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}</div>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">"Practicing in both English and Turkish was a game-changer. It caught my technical jargon mistakes before my actual engineering interview."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">MK</div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Mert K.</h4>
                    <p className="text-neutral-500 text-xs">Software Engineer</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Star className="w-12 h-12 fill-white" /></div>
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}</div>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">"I loved the instant hire probability score. It gamified my interview prep and gave me the confidence I needed to succeed."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">JD</div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Jessica D.</h4>
                    <p className="text-neutral-500 text-xs">Marketing Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === How it Works Section === */}
        <div className="bg-neutral-900 border-y border-white/5 py-16 sm:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-10 sm:mb-20">
               <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6">{t('how_it_works_badge')}</div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-white px-2">{t('how_it_works_title')}</h2>
              <p className="text-neutral-400 text-sm sm:text-lg px-4">{t('how_it_works_sub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group hover:border-white/10 transition-colors">
                 <div className="h-56 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                    <div className="w-[85%] bg-neutral-900/90 backdrop-blur-sm rounded-xl border border-white/10 p-5 shadow-xl z-10 group-hover:scale-[1.03] transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Mic className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="text-xs text-neutral-300 font-medium tracking-wide">Interviewer is speaking...</div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-neutral-800 rounded-full" />
                            <div className="h-2 w-4/5 bg-neutral-800 rounded-full animate-pulse" />
                        </div>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-neutral-950">
                    <h3 className="text-xl font-bold mb-3 text-white">{t('step1_title')}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{t('step1_desc')}</p>
                 </div>
              </div>

              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group hover:border-white/10 transition-colors">
                 <div className="h-56 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 p-6 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                    <div className="w-[90%] bg-neutral-900/90 backdrop-blur-sm rounded-xl border border-purple-500/30 p-5 shadow-xl shadow-purple-500/10 z-10 group-hover:scale-[1.03] transition-transform duration-500">
                        <div className="text-xs text-purple-400 font-bold mb-3 flex items-center gap-2">
                          <Bot className="h-4 w-4" /> Detecting Question...
                        </div>
                        <div className="text-sm text-neutral-200 leading-relaxed font-medium">"<span className="text-purple-300 bg-purple-500/20 px-1 rounded border border-purple-500/30">Can you share a situation</span> where you had to adapt quickly?"</div>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-neutral-950">
                    <h3 className="text-xl font-bold mb-3 text-white">{t('step2_title')}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{t('step2_desc')}</p>
                 </div>
              </div>

              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group hover:border-white/10 transition-colors">
                 <div className="h-56 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 p-6 flex items-center justify-center relative overflow-hidden gap-6">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                    <div className="bg-neutral-900/90 backdrop-blur flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-5 z-10 shadow-xl group-hover:-translate-y-2 group-hover:-rotate-3 transition-transform duration-500">
                         <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-1"><Target className="h-6 w-6 text-emerald-400" /></div>
                         <div className="h-1.5 w-12 bg-neutral-800 rounded-full mb-1" />
                         <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Target Job</span>
                    </div>
                    <div className="bg-neutral-900/90 backdrop-blur flex flex-col items-center gap-3 rounded-2xl border border-white/10 p-5 z-10 shadow-xl group-hover:-translate-y-2 group-hover:rotate-3 transition-transform duration-500">
                         <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-1"><FileText className="h-6 w-6 text-blue-400" /></div>
                         <div className="h-1.5 w-12 bg-neutral-800 rounded-full mb-1" />
                         <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Your CV</span>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-neutral-950">
                    <h3 className="text-xl font-bold mb-3 text-white">{t('step3_title')}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{t('step3_desc')}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Features Grid === */}
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-32 max-w-5xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4">{t('features_title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-4 sm:gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">{t('feat1_title')}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{t('feat1_desc')}</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">{t('feat2_title')}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{t('feat2_desc')}</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">{t('feat3_title')}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{t('feat3_desc')}</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-semibold mb-2">{t('feat4_title')}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{t('feat4_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* === Final CTA === */}
        <div className="border-t border-white/5 py-16 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6 sm:mb-8">{t('cta_title')}</h2>
            <Button asChild size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full">
              <Link href="/signup">
                {t('cta_button')}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-6 bg-[#050505]">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500 mb-8">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Intervio Logo" width={24} height={24} className="h-6 w-6 object-contain rounded opacity-70" />
                <span translate="no" className="notranslate">© {new Date().getFullYear()} Intervio AI. All rights reserved.</span>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white transition-colors">{t('footer_privacy')}</Link>
                <Link href="/terms" className="hover:text-white transition-colors">{t('footer_terms')}</Link>
              </div>
            </div>
            <div className="text-xs text-neutral-600 text-center md:text-left max-w-3xl">
              {t('footer_desc')}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
