import type React from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import type { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { Navbar } from "~~/components/navbar";
// import WhyDidYouRenderInit from './WhyDidYouRenderInit';

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
      <head>
        {/* GA4 脚本 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-32GF1KTNB8" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-32GF1KTNB8');
          `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-black to-zinc-900`}>
        {/* <WhyDidYouRenderInit /> */}
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
