import HeroScene from "./HeroScene";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="hero-aurora -z-20" />
      <HeroScene />
      <div aria-hidden className="hero-scrim -z-0" />
      <div aria-hidden className="hero-noise pointer-events-none z-20" />
      <div aria-hidden className="hero-fade-bottom pointer-events-none z-20" />

      <div className="relative z-10 flex max-w-xl flex-col items-center gap-5">
        <span className="rounded-full border border-border/80 bg-background/40 px-3 py-1 font-mono text-xs tracking-wide text-muted-foreground backdrop-blur-sm">
          live on monad testnet
        </span>
        <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tighter text-foreground sm:text-4xl lg:text-5xl">
          Every decision your trading agent makes,{" "}
          <span className="text-gradient">committed onchain</span> before it executes.
        </h1>
        <p className="text-base tracking-wide text-muted-foreground sm:text-lg">
          See it. Verify it. Trust it.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/feed"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-[0_0_30px_-8px_var(--accent)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            View the live feed
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Read the docs →
          </a>
        </div>
      </div>
    </section>
  );
}
