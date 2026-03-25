import Link from "next/link";
import { BrainCircuit, Sparkles, Target, Mic, FileText, ArrowRight, CheckCircle2, Zap, PlayCircle, BarChart3, Star, Bot, TrendingUp, Building2, MonitorSmartphone } from "lucide-react";
import { AnimatedAuthBackground } from "@/components/ui/animated-background";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-50 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/15 mix-blend-screen blur-[100px] rounded-full animate-float" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[60vw] bg-indigo-900/10 mix-blend-screen blur-[120px] rounded-full animate-float-delayed" />
        <div className="absolute bottom-[-20%] left-[15%] w-[60vw] h-[50vw] bg-purple-900/15 mix-blend-screen blur-[120px] rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Intervio Logo" className="h-10 w-10 object-contain rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Intervio</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Log In
            </Link>
            <Button asChild className="bg-white text-black hover:bg-neutral-200 rounded-full px-5 h-9 text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 lg:pt-40">
        <AnimatedAuthBackground />
        {/* === Hero Section === */}
        <div className="container mx-auto max-w-5xl text-center px-6 mb-24 lg:mb-32">
          {/* Badge */}
          <div className="animate-fade-in-up animation-delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-6 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="h-4 w-4" />
            <span>Free: 2 interviews/month — No credit card needed</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animation-delay-200 text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight mb-6 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">
            Practice Real Job Interviews <br />
            with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">AI</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in-up animation-delay-300 text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Paste a job link, upload your CV, and start your AI-powered mock interview in seconds.
            Get your <span className="text-white font-medium">hire probability score</span> instantly.
          </p>

          <div className="animate-fade-in-up animation-delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full w-full sm:w-auto shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95">
              <Link href="/signup">
                Start Practicing for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="animate-fade-in-up animation-delay-500 flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2 free interviews/month</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant hire probability</span>
          </div>
        </div>

        {/* === Interactive App Preview Section === */}
        <div className="container mx-auto px-6 mb-32 lg:mb-48">
          <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 p-1 ring-1 ring-white/10 shadow-2xl relative overflow-hidden group">
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="rounded-xl bg-[#0a0a0a] overflow-hidden border border-white/5 relative">
              {/* Floating elements inside mockup */}
              <div className="absolute top-10 right-10 bg-neutral-900/80 backdrop-blur-md rounded-lg p-4 border border-white/5 hidden lg:flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">STAR Method</p>
                  <p className="text-xs text-green-400">Excellent Example</p>
                </div>
              </div>

              {/* Mockup content */}
              <div className="p-10 flex flex-col items-center justify-center min-h-[400px] bg-[url('/grid.svg')] bg-center relative">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.5)] mb-8 relative">
                  <Bot className="h-10 w-10 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-full ring-2 ring-blue-400 ring-offset-4 ring-offset-[#0a0a0a] animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                <div className="text-center max-w-md">
                  <div className="inline-block px-4 py-2 rounded-full bg-neutral-800 text-neutral-300 text-sm mb-4">
                    "Interviewer is speaking..."
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-2 leading-tight">Can you tell me about a time you had to deal with an unhappy customer?</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Trusted By Section === */}
        <div className="pt-10 pb-20 mt-10 lg:mt-0 relative z-10">
          <div className="container mx-auto px-6 max-w-6xl">
            <p className="text-center text-lg lg:text-xl font-bold text-neutral-300 mb-12 tracking-tight">Trusted by professionals from the world's best companies...</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24 opacity-75 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0">
              <span className="text-2xl font-medium font-sans tracking-tighter flex items-center gap-0.5">
                <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span>
              </span>
              <span className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
                <div className="grid grid-cols-2 gap-[2px]"><div className="w-2.5 h-2.5 bg-[#f25022]"/><div className="w-2.5 h-2.5 bg-[#7fba00]"/><div className="w-2.5 h-2.5 bg-[#00a4ef]"/><div className="w-2.5 h-2.5 bg-[#ffb900]"/></div>
                Microsoft
              </span>
              <span className="text-2xl font-semibold tracking-tight text-neutral-200 flex items-center gap-1">
                <span className="text-3xl"></span> Apple
              </span>
              <span className="text-2xl font-black tracking-widest text-[#E50914] font-sans">NETFLIX</span>
              <span className="text-2xl font-bold tracking-tighter text-white flex items-baseline gap-1">
                amazon<span className="text-[#FF9900] -ml-1 mt-1 text-3xl font-black leading-[0]">_</span>
              </span>
              <span className="text-2xl font-bold tracking-tighter text-[#0668E1] flex items-center gap-1">
                <span className="text-3xl">∞</span> Meta
              </span>
            </div>
          </div>
        </div>

        {/* === How it Works Section === */}
        <div className="bg-neutral-900 border-y border-white/5 py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-20">
               <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6">Leading Technology</div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">How AI Interview Copilot works?</h2>
              <p className="text-neutral-400 text-lg">Get real-time, personalized coaching tailored to your resume, job description, and company</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group hover:border-white/10 transition-colors">
                 <div className="h-56 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 p-6 flex flex-col justify-end relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
                    <div className="absolute top-10 left-8 right-8 bg-[#1a1a1a] rounded-t-xl border border-white/10 p-5 translate-y-8 group-hover:translate-y-4 transition-transform duration-500 shadow-2xl">
                        <div className="text-xs text-neutral-500 font-medium mb-3">Interviewer Transcription</div>
                        <div className="h-2 w-1/3 bg-blue-500/30 rounded-full mb-3" />
                        <div className="h-2 w-full bg-neutral-800 rounded-full mb-2" />
                        <div className="h-2 w-3/4 bg-neutral-800 rounded-full" />
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-neutral-950">
                    <h3 className="text-xl font-bold mb-3 text-white">Live Transcription</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">Capture every interview detail that would make crucial difference. Practice behavioral, technical, or startup-style questions seamlessly.</p>
                 </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group hover:border-white/10 transition-colors">
                 <div className="h-56 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 p-6 flex items-end relative overflow-hidden justify-center">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
                    <div className="absolute -bottom-4 bg-[#1a1a1a] rounded-xl border border-white/10 p-5 translate-y-6 group-hover:-translate-y-2 transition-transform duration-500 shadow-2xl w-[85%]">
                        <div className="text-xs text-purple-400 font-bold mb-2 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"/> Detecting Question</div>
                        <div className="text-xs text-neutral-300 leading-relaxed font-medium">...<span className="text-purple-300">could you share an example of when you overcame a major challenge</span> at work?</div>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-neutral-950">
                    <h3 className="text-xl font-bold mb-3 text-white">Auto Question Detection</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">Automatically detects questions for instant, precise contextual answers. Get scored heavily on STAR framework precision.</p>
                 </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group hover:border-white/10 transition-colors">
                 <div className="h-56 bg-gradient-to-br from-emerald-900/20 to-teal-900/10 p-6 flex items-center justify-center relative overflow-hidden gap-4">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
                    <div className="bg-white border border-white/20 p-4 flex flex-col items-center gap-2 rounded-xl group-hover:-translate-y-3 transition-transform duration-500 delay-75 shadow-lg w-24">
                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-1"><Target className="h-5 w-5 text-blue-600" /></div>
                         <div className="h-1 w-10 bg-neutral-200 rounded-full mb-1" />
                         <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mt-1">Job Info</span>
                    </div>
                    <div className="bg-white border border-white/20 p-4 flex flex-col items-center gap-2 rounded-xl group-hover:-translate-y-3 transition-transform duration-500 delay-150 shadow-lg w-24 scale-110 z-10">
                         <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-1"><FileText className="h-5 w-5 text-emerald-600" /></div>
                         <div className="h-1 w-12 bg-neutral-200 rounded-full mb-1" />
                         <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1">Resume</span>
                    </div>
                 </div>
                 <div className="p-8 flex-1 bg-neutral-950">
                    <h3 className="text-xl font-bold mb-3 text-white">Personalized AI Copilot</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">Highlight skills and experience from your CV that perfectly align with company values and job requirements.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Features Grid === */}
        <div className="container mx-auto px-6 py-32 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to succeed</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Real-time Voice Interactions</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Using advanced WebRTC and text-to-speech, your AI interviewer talks to you with realistic latency and pauses, just like a human.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Deep Analytics</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  After every interview, receive a detailed breakdown of your performance, highlighting areas where you lacked clarity or metrics.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Company Personas</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Practicing for Amazon? We'll test you heavily on Leadership Principles. Interviewing with a startup? Expect questions about ambiguity.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors flex gap-6">
              <div className="shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bilingual Support</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Practice in English or Turkish. Perfect for non-native speakers preparing for global roles or local opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === Final CTA === */}
        <div className="border-t border-white/5 py-32">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to land your dream job?</h2>
            <Button asChild size="lg" className="h-14 px-10 text-base bg-blue-600 hover:bg-blue-500 text-white rounded-full">
              <Link href="/signup">
                Create your free account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-6 bg-[#050505]">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Intervio Logo" className="h-6 w-6 object-contain rounded opacity-70" />
              <span>© {new Date().getFullYear()} Intervio AI. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
