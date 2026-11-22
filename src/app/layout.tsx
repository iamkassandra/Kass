import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/AuthWrapper";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "KOMMANDRA — Executive AI Profit Ops Suite",
  description: "Autonomous executive workstation, AI sales squad, 12-hour profit forecasting, and sovereign ops orchestration.",
  openGraph: {
    title: "KOMMANDRA — Executive AI Profit Ops Suite",
    description: "Autonomous executive workstation, AI sales squad, 12-hour profit forecasting, and sovereign ops orchestration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable} dark`}>
      <body className="antialiased font-sans bg-[#0a0d16] text-slate-100 selection:bg-pink-400/30 selection:text-pink-100">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
