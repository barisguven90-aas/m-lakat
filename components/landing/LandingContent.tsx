"use client";

import Link from "next/link";
import { BrainCircuit, Sparkles, Target, Mic, FileText, ArrowRight, CheckCircle2, Zap, PlayCircle, BarChart3, Star, Bot, TrendingUp, Building2, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/dashboard/LanguageToggle";
import { DemoSection } from "@/components/landing/DemoSection";
import { useLanguageStore } from "@/store/useLanguageStore";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.2 }
};

const scaleUp = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

export function LandingContent() {
  const { t, language } = useLanguageStore();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Light, friendly background accents */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] sm:w-[50vw] h-[80vw] sm:h-[50vw] bg-blue-200/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[20%] right-[-10%] w-[70vw] sm:w-[40vw] h-[90vw] sm:h-[60vw] bg-purple-200/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-20%] left-[15%] w-[90vw] sm:w-[60vw] h-[80vw] sm:h-[50vw] bg-rose-200/50 rounded-full blur-3xl opacity-60" />
      </div>

      <nav className="fixed top-0 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl z-50 transition-all duration-300 shadow-sm">
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
            <Button asChild className="bg-primary text-primary-foreground hover:bg-blue-600 rounded-full px-4 sm:px-6 h-8 sm:h-10 text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5">
              <Link href="/signup">{t('get_started')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24 sm:pt-32 lg:pt-40">
        
        {/* === Hero Section === */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 mb-16 sm:mb-24 lg:mb-32 flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs sm:text-sm mb-6 font-bold shadow-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 suppressHydrationWarning className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900 drop-shadow-sm">
              {t('hero_h1_1')}{" "}
              <br className="sm:hidden" />
              {t('hero_h1_2')}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('hero_h1_3')} AI</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium px-2 lg:px-0">
              {t('hero_subtext')}
            </p>

            <div className="w-full">
              <DemoSection />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 text-xs sm:text-sm text-slate-500 font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> {t('trust_1')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> {t('trust_2')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> {t('trust_3')}</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-300/40 rounded-full blur-3xl scale-90 group-hover:scale-110 transition-transform duration-700" />
              <Image 
                src="/mascot.png" 
                alt="Coach Cappy - The Capybara" 
                width={480} 
                height={480} 
                className="object-contain relative z-10 drop-shadow-2xl mix-blend-multiply transition-transform duration-500 hover:scale-105 hover:-rotate-2" 
                priority 
              />
            </div>
          </motion.div>
        </div>

        {/* === Interactive App Preview Section === */}
        <motion.div 
          className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-32 lg:mb-40"
          {...scaleUp}
        >
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-white p-3 ring-1 ring-slate-200 shadow-[0_30px_60px_-15px_rgba(37,99,235,0.15)] relative overflow-hidden group">
            <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden border border-slate-100 relative">
              
              <motion.div 
                className="absolute top-8 right-8 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200 hidden md:flex items-center gap-4 shadow-xl z-20"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                animate={{ y: [0, -10, 0] }}
                style={{ animation: 'float 4s ease-in-out infinite' }}
              >
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">STAR Method</p>
                  <p className="text-sm font-bold text-emerald-600">Excellent Example</p>
                </div>
              </motion.div>

              <div className="p-8 sm:p-16 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[500px] relative">
                <div className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-2xl mb-8 relative border-4 border-blue-100 z-10 hover:scale-110 transition-transform duration-300">
                   <Image src="/mascot.png" alt="Mascot" width={90} height={90} className="object-contain mix-blend-multiply" />
                </div>
                <div className="text-center max-w-xl px-4 z-10">
                  <div className="inline-block px-5 py-2.5 rounded-full bg-blue-100 text-blue-800 text-sm sm:text-base font-bold mb-6 shadow-sm border border-blue-200">
                    &quot;{t('mockup_speaking')}&quot;
                  </div>
                  <h3 className="text-xl sm:text-4xl font-extrabold text-slate-800 mb-2 leading-tight">{t('mockup_question')}</h3>
                </div>
                
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* === How it Works Section === */}
        <div className="bg-white border-y border-slate-200 py-20 sm:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <motion.div 
              className="text-center mb-16 sm:mb-20"
              {...fadeInUp}
            >
               <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-extrabold uppercase tracking-widest mb-6 shadow-sm">{t('how_it_works_badge')}</div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 text-slate-900">{t('how_it_works_title')}</h2>
              <p className="text-slate-600 text-lg sm:text-xl px-4 max-w-2xl mx-auto font-medium">{t('how_it_works_sub')}</p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeInUp} className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-md flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                 <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-50 p-6 flex flex-col items-center justify-center relative">
                    <div className="w-[85%] bg-white rounded-2xl border border-slate-200 p-6 shadow-md z-10 group-hover:scale-105 transition-transform duration-500">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                <Image src="/mascot.png" alt="Mascot" width={32} height={32} className="mix-blend-multiply" />
                            </div>
                            <div className="text-base text-slate-800 font-bold">Cappy is speaking...</div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-2.5 w-full bg-slate-100 rounded-full" />
                            <div className="h-2.5 w-4/5 bg-blue-200 rounded-full animate-pulse" />
                        </div>
                    </div>
                 </div>
                 <div className="p-10 flex-1 bg-white">
                    <h3 className="text-2xl font-extrabold mb-4 text-slate-900">{t('step1_title')}</h3>
                    <p className="text-slate-600 text-base leading-relaxed font-medium">{t('step1_desc')}</p>
                 </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-md flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                 <div className="h-64 bg-gradient-to-br from-purple-100 to-purple-50 p-6 flex items-center justify-center relative">
                    <div className="w-[90%] bg-white rounded-2xl border border-slate-200 p-6 shadow-md z-10 group-hover:scale-105 transition-transform duration-500">
                        <div className="text-sm text-purple-600 font-extrabold mb-4 flex items-center gap-2">
                          <Bot className="h-5 w-5" /> Analyzing Answer...
                        </div>
                        <div className="text-base text-slate-800 leading-relaxed font-bold">"<span className="text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">Can you share a situation</span> where you had to adapt quickly?"</div>
                    </div>
                 </div>
                 <div className="p-10 flex-1 bg-white">
                    <h3 className="text-2xl font-extrabold mb-4 text-slate-900">{t('step2_title')}</h3>
                    <p className="text-slate-600 text-base leading-relaxed font-medium">{t('step2_desc')}</p>
                 </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-md flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                 <div className="h-64 bg-gradient-to-br from-emerald-100 to-emerald-50 p-6 flex items-center justify-center relative gap-6">
                    <div className="bg-white flex flex-col items-center gap-4 rounded-2xl border border-slate-200 p-6 z-10 shadow-md group-hover:-translate-y-2 group-hover:-rotate-6 transition-transform duration-500">
                         <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-1"><Target className="h-7 w-7 text-emerald-600" /></div>
                         <div className="h-2 w-14 bg-slate-100 rounded-full mb-1" />
                         <span className="text-xs text-emerald-700 font-extrabold uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Target Job</span>
                    </div>
                    <div className="bg-white flex flex-col items-center gap-4 rounded-2xl border border-slate-200 p-6 z-10 shadow-md group-hover:-translate-y-2 group-hover:rotate-6 transition-transform duration-500">
                         <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-1"><FileText className="h-7 w-7 text-blue-600" /></div>
                         <div className="h-2 w-14 bg-slate-100 rounded-full mb-1" />
                         <span className="text-xs text-blue-700 font-extrabold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">Your CV</span>
                    </div>
                 </div>
                 <div className="p-10 flex-1 bg-white">
                    <h3 className="text-2xl font-extrabold mb-4 text-slate-900">{t('step3_title')}</h3>
                    <p className="text-slate-600 text-base leading-relaxed font-medium">{t('step3_desc')}</p>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* === Final CTA === */}
        <div className="py-24 sm:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl" />
          
          <motion.div 
            className="container mx-auto px-4 sm:px-6 text-center max-w-4xl relative z-10"
            {...scaleUp}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-8 sm:mb-10 text-slate-900 leading-tight">
              {t('cta_title')}
            </h2>
            <Button asChild size="lg" className="h-16 sm:h-20 px-12 sm:px-16 text-lg sm:text-xl font-black bg-primary hover:bg-blue-600 text-white rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
              <Link href="/signup">
                {t('cta_button')}
                <ArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-12 px-6 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 mb-8 font-bold">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Intervio Logo" width={32} height={32} className="h-8 w-8 object-contain rounded" />
                <span translate="no" className="notranslate">© {new Date().getFullYear()} Intervio AI. All rights reserved.</span>
              </div>
              <div className="flex gap-8">
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
