import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XANDSCOPE | Xandeum pNode Analytics",
  description: "Real-time analytics dashboard for monitoring Xandeum pNodes - the scalable storage layer for Solana",
  keywords: ["Xandeum", "pNode", "Solana", "storage", "analytics", "blockchain"],
  authors: [{ name: "XANDSCOPE" }],
  openGraph: {
    title: "XANDSCOPE | Xandeum pNode Analytics",
    description: "Real-time analytics dashboard for monitoring Xandeum pNodes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen bg-[#0a0a0f] font-sans text-white antialiased`}
      >
        <Providers>
          {/* Background gradient */}
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(0,0,0,0))]" />
          
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 sm:h-10 sm:w-10">
                  <span className="text-lg font-bold text-black sm:text-xl">X</span>
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight sm:text-lg">XANDSCOPE</h1>
                  <p className="hidden text-xs text-gray-500 sm:block">Xandeum pNode Analytics</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden items-center gap-6 md:flex">
                <a 
                  href="https://xandeum.network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Xandeum
                </a>
                <a 
                  href="https://docs.xandeum.network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Docs
                </a>
                <a 
                  href="https://discord.gg/uqRSmmM5m" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400"
                >
                  Join Discord
                </a>
              </nav>
              
              {/* Mobile Navigation */}
              <MobileNav />
            </div>
          </header>
          
          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-white/10 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-gray-500">
                  Built for Xandeum Labs Bounty • Data from DevNet
                </p>
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} XANDSCOPE
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
