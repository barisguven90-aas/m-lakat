import { LandingContent } from "@/components/landing/LandingContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intervio — AI Mock Interview Practice | Mülakat Hazırlık",
  description: "Yapay zeka ile gerçekçi iş mülakatı pratiği yap. CV'ni yükle, iş ilanını yapıştır, anında başla. Her ay 2 mülakat ücretsiz. AI mock interview, bilingual EN/TR.",
  keywords: ["ai mock interview", "interview practice", "mülakat hazırlık", "mülakat soruları", "AI interview", "hire probability", "interview prep", "iş mülakatı", "yapay zeka mülakat"],
  openGraph: {
    title: "Intervio — AI Mock Interview | Mülakat Hazırlık",
    description: "CV'ni yükle, iş ilanını yapıştır, yapay zeka ile mülakat pratiği yap. Anında hire probability skoru al.",
    type: "website",
  },
  alternates: {
    canonical: "https://intervioai.com/",
  }
};

export default function LandingPage() {
  // We use a client component for the actual content so that language switching (i18n) works perfectly without Google Translate.
  // The SEO metadata is exported above, preserving full indexability for Google.
  return <LandingContent />;
}
