import Link from "next/link";
import { BrainCircuit, Sparkles, Target, Mic, FileText, ArrowRight, CheckCircle2, Zap, PlayCircle, BarChart3, Star, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-50 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 mix-blend-screen blur-[120px] rounded-full" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[60%] bg-indigo-900/10 mix-blend-screen blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <BrainCircuit className="h-5 w-5 text-blue-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Intervio</span>
          </div>
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

      <main className="relative z-10 pt-32 lg:pt-40">
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
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 hover:text-white rounded-full w-full sm:w-auto transition-all hover:scale-105 active:scale-95">
              <Link href="/pricing">
                <Star className="mr-2 h-5 w-5 text-yellow-400" />
                View Pricing
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
              <div className="absolute top-10 right-10 bg-neutral-900/80 backdrop-blur-md rounded-lg p-4 border border-white/5 flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
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

        {/* === How it Works Section === */}
        <div className="bg-neutral-900/50 border-y border-white/5 py-32 relative overflow-hidden">
          <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent hidden lg:block" />

          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
              <p className="text-neutral-400 text-lg">From zero to ready in three simple steps.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
              {/* Step 1 */}
              <div className="relative text-center lg:text-left bg-neutral-950 p-8 rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto lg:mx-0 mb-6 border border-blue-500/20">
                  <span className="text-xl font-bold text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Paste a Job Link</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">
                  Find your dream job on LinkedIn and paste the URL. Our engine scrapes the exact real-world requirements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center lg:text-left bg-neutral-950 p-8 rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto lg:mx-0 mb-6 border border-indigo-500/20">
                  <span className="text-xl font-bold text-indigo-400">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload your CV</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">
                  Give the AI context. Upload your PDF resume so the interviewer can ask personalized questions about your background.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center lg:text-left bg-neutral-950 p-8 rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto lg:mx-0 mb-6 border border-purple-500/20">
                  <span className="text-xl font-bold text-purple-400">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Start Talking</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">
                  Jump into a real-time voice call. Practice behavioral, technical, or startup-style questions and get scored instantly.
                </p>
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
                <h3 className="text-xl font-semibold mb-2">Multilingual Support</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Practice in English, Turkish, Spanish, French, German, or Chinese. Perfect for non-native speakers preparing for global roles.
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
              <BrainCircuit className="h-5 w-5 text-neutral-600" />
              <span>© {new Date().getFullYear()} Intervio AI. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
