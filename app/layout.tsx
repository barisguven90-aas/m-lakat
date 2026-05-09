import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { PHProvider, PostHogPageView } from "@/app/providers";
import { Suspense } from "react";
import { GoogleTranslate } from "@/components/GoogleTranslate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://intervioai.com'),
  title: {
    default: "Intervio — AI Mock Interview Practice | Mülakat Hazırlık",
    template: "%s | Intervio"
  },
  description: "Yapay zeka ile gerçekçi iş mülakatı pratiği yap. CV'ni yükle, iş ilanını yapıştır, anında başla. Her ay 2 mülakat ücretsiz. AI mock interview, bilingual EN/TR.",
  keywords: ["ai mock interview", "interview practice", "mülakat hazırlık", "mülakat soruları", "AI interview", "hire probability", "interview prep", "iş mülakatı", "yapay zeka mülakat"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Intervio — AI Mock Interview | Mülakat Hazırlık",
    description: "CV'ni yükle, iş ilanını yapıştır, yapay zeka ile mülakat pratiği yap. Anında hire probability skoru al.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Intervio",
              "description": "AI powered mock interview practice platform. Practice job interviews with AI in English and Turkish.",
              "url": "https://intervioai.com",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "2 free interviews per month"
              },
              "inLanguage": ["en", "tr"]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PHProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </ThemeProvider>
        </PHProvider>
        <GoogleAnalytics gaId="G-RWSVD2T707" />
        <GoogleTranslate />
      </body>
    </html>
  );
}
