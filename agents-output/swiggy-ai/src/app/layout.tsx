import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swiggy AI — Personalised Homepage",
  description: "LLM-powered personalised food delivery homepage using RAG + Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white min-h-screen overflow-x-hidden`}>{children}</body>
    </html>
  );
}
