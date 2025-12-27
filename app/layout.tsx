import type React from "react";
import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {Analytics} from "@vercel/analytics/next";
import {SplashScreen} from "@/components/splash-screen";
import "./globals.css";
import {Toaster} from "sonner";
import {ThemeProviders} from "./theme-provider";

const _geist = Geist({subsets: ["latin"]});
const _geistMono = Geist_Mono({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "VersePoints - Mine Points Daily",
  description: "Earn VersePoints through daily mining and referrals. Join the future of rewards.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProviders>
          <SplashScreen />
          {children}
          <Analytics />
          <Toaster position="top-right" richColors closeButton expand />
        </ThemeProviders>
      </body>
    </html>
  );
}
