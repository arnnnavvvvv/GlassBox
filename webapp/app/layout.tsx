import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlassBox — See it. Verify it. Trust it.",
  description: "Every decision your trading agent makes, committed onchain before it executes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-sm border border-accent/70 bg-accent/20"
              />
              GlassBox
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/feed" className="transition-colors hover:text-foreground">
                Live feed
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/80 px-6 py-8 text-center text-xs text-muted-foreground">
          Every commit reads directly from Monad testnet. Nothing shown here is simulated.
        </footer>
      </body>
    </html>
  );
}
