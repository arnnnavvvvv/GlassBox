import HeroScene from "./HeroScene";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center gap-6 overflow-hidden px-6 pb-24 pt-16 text-center sm:gap-8 sm:pt-20">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />

      <HeroScene />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-5">
        <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
          live on monad testnet
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Every decision your trading agent makes,{" "}
          <span className="text-gradient">committed onchain</span> before it executes.
        </h1>
        <p className="text-lg text-muted-foreground">See it. Verify it. Trust it.</p>
        <a
          href="/feed"
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-[0_0_30px_-8px_var(--accent)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          View the live feed
        </a>
      </div>
    </section>
  );
}
