import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import CursorGlass from "@/components/CursorGlass";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://glassbox.arnxv.xyz";
const TITLE = "GlassBox — See it. Verify it. Trust it.";
const DESCRIPTION = "Every decision your trading agent makes, committed onchain before it executes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "GlassBox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CursorGlass />
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-[7px] bg-background"
              >
                <span className="flex h-3 w-3 items-center justify-center rounded-[2px] border-[1.5px] border-accent">
                  <span className="h-1 w-1 rounded-[1px] bg-accent/70" />
                </span>
              </span>
              GlassBox
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/docs" className="transition-colors hover:text-foreground">
                Docs
              </Link>
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
