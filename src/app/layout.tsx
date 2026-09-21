import type { Metadata } from "next";
import "./globals.css";
import { AuthWrapper } from "@/components/auth/AuthWrapper";

export const metadata: Metadata = {
  title: "AI Agent Team - Autonomous Development Platform",
  description: "Advanced AI agent system for autonomous business development and deployment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
