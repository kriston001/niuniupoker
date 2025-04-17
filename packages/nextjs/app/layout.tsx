import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "~~/components/navbar";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NiuNiu Poker - Blockchain Poker Platform",
  description: "A modern blockchain-based NiuNiu poker game platform",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-black to-zinc-900`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ScaffoldEthAppWithProviders>
            <Navbar />
            <div className="pt-16">{children}</div>
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
