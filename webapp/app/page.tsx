import Hero from "@/components/Hero";

const steps = [
  {
    title: "Propose",
    body: "A trading agent proposes an action. An independent risk agent evaluates it against policy -- without seeing the trading agent's reasoning.",
  },
  {
    title: "Commit",
    body: "Both the proposal and the verdict are hashed and committed to an append-only contract on Monad testnet -- before execution is allowed to proceed.",
  },
  {
    title: "Verify",
    body: "Anyone can recompute the hash from the raw record and compare it to what's onchain. No trust in our frontend or database required.",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Audit trails you don&apos;t have to trust
          </h2>
          <p className="mt-3 text-muted-foreground">
            AI trading agents already produce audit trails -- but they&apos;re self-declared and
            editable by the same party being audited. GlassBox makes tampering visible instead of
            asking you to take our word for it.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-up rounded-lg border border-border bg-surface p-6"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="mb-3 font-mono text-xs text-accent">0{i + 1}</div>
              <h3 className="mb-2 font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
