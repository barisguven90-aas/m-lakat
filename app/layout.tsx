import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    default: "Intervio — Practice Real Job Interviews with AI",
    template: "%s | Intervio"
  },
  description: "Paste a job link, upload your CV, and start your AI-powered mock interview in seconds. Get your hire probability score instantly.",
  keywords: ["interview prep", "mock interview", "AI interview", "job interview", "hire probability", "intervio", "mülakat"],
  openGraph: {
    title: "Intervio — Practice Real Job Interviews with AI",
    description: "Paste a job link, upload your CV, and get your hire probability score instantly.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
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
      </body>
    </html>
  );
}
