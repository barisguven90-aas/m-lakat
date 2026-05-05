import React from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 selection:bg-blue-500/30">
      <nav className="fixed top-0 w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Intervio Logo" className="h-8 w-8 object-contain rounded" />
            <span translate="no" className="notranslate font-bold text-lg tracking-tight text-white">Intervio</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-white">Privacy Policy</h1>
          <p className="text-neutral-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, such as your name, email address (e.g., via Google Auth), and any resumes or job descriptions you upload to use our AI interview services.
                We also collect audio recordings and transcriptions during your interview practice sessions solely for the purpose of analyzing your performance and providing feedback.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to operate, maintain, and provide the features and functionality of the Service. Specifically, your audio and transcriptions are processed by our AI models to generate tailored interview feedback, scores, and coaching suggestions. We do NOT use your personal interview data or resumes to train public AI models without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Information Sharing</h2>
              <p>
                We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. We may share information with trusted third-party service providers (such as OpenAI/Anthropic for AI processing, Supabase for database/authentication, and Stripe for payments) strictly to perform functions and provide services to us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
              <p>
                We use reasonable administrative, logical, physical and managerial measures to safeguard your personal information against loss, theft and unauthorized access, use and modification. Video and audio streams are processed securely and temporarily stored only as necessary to generate your coaching reports.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Your Choices</h2>
              <p>
                You may update, correct, or delete your account information and preferences at any time by accessing your Account Settings page. You may also contact us to request the deletion of all your interview data and uploaded resumes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. KVKK Kapsamında Haklarınız</h2>
              <p>
                [Buraya KVKK aydınlatma metni eklenecek]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at support@intervioai.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
