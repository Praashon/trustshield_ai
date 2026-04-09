import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustShield AI | AI-Powered Phishing Detection",
  description:
    "Detect phishing URLs, messages, and emails with AI-driven analysis. Real-time scanning, interactive learning, and comprehensive security awareness.",
  keywords: [
    "phishing detection",
    "cybersecurity",
    "AI security",
    "email scanning",
    "URL checker",
  ],
  authors: [{ name: "TrustShield AI" }],
  openGraph: {
    title: "TrustShield AI | AI-Powered Phishing Detection",
    description:
      "Detect phishing threats instantly with AI-driven analysis and real-time scanning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jbMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
