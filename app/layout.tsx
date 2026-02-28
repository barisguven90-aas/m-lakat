import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Interview Coach — AI-Powered Mock Interviews",
    template: "%s | Interview Coach"
  },
  description: "Practice job interviews with an AI coach tailored to your CV and target role. Get instant feedback, company-style questions, and detailed performance reports.",
  keywords: ["interview prep", "mock interview", "AI coach", "job interview", "career", "mülakat koçu"],
  openGraph: {
    title: "Interview Coach — AI-Powered Mock Interviews",
    description: "Practice job interviews with an AI coach tailored to your CV and target role.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
