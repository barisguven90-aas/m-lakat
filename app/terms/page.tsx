import React from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 selection:bg-blue-500/30">
      <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Intervio Logo" className="h-8 w-8 object-contain rounded" />
            <span className="font-bold text-lg tracking-tight text-white">Intervio</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-white">Terms of Service</h1>
          <p className="text-neutral-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Intervio AI ("Service"), you accept and agree to be bound by the terms and provision of this agreement. Any participation in this Service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
              <p>
                Our Service provides an AI-powered interview coaching platform that analyzes audio input and uploaded resumes to provide personalized feedback. The output generated is for educational and preparatory purposes. We do not guarantee employment or interview success resulting from the use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. User Conduct</h2>
              <p>
                As a condition of use, you promise not to use the Service for any purpose that is unlawful or prohibited by these Terms, or any other purpose not reasonably intended by Intervio AI. 
                You agree not to attempt to hack, reverse-engineer, or maliciously overload our systems, or upload any malware or illegal content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Accounts and Billing</h2>
              <p>
                If you choose a paid subscription, you agree to provide complete and accurate billing information. All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities. Subscription cancellations must be performed prior to the next billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Limitation of Liability</h2>
              <p>
                Intervio AI and its suppliers and licensors hereby disclaim all warranties of any kind, express or implied, including, without limitation, the warranties of merchantability, fitness for a particular purpose and non-infringement. We shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We shall give notice of these modifications by revising the Date at the top of this document.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
