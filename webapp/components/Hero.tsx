// Pure SVG + CSS animation -- no animation library, so the landing page's
// first paint stays fast. The wireframe cube (see-through by construction)
// plus decisions visibly passing through it is the one place the GlassBox
// name should be *felt*, not just read.
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center gap-10 overflow-hidden px-6 pb-24 pt-20 text-center sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/15 blur-[110px] animate-glow-pulse"
      />

      <div className="relative">
        <svg
          viewBox="0 0 320 280"
          className="h-[220px] w-[220px] sm:h-[280px] sm:w-[280px]"
          role="img"
          aria-label="A transparent wireframe box with decisions passing visibly through it"
        >
          <g
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.55"
          >
            <path className="glassbox-edge" style={{ animationDelay: "0ms" }} d="M160,40 L255,90" />
            <path className="glassbox-edge" style={{ animationDelay: "60ms" }} d="M255,90 L160,140" />
            <path className="glassbox-edge" style={{ animationDelay: "120ms" }} d="M160,140 L65,90" />
            <path className="glassbox-edge" style={{ animationDelay: "180ms" }} d="M65,90 L160,40" />
            <path className="glassbox-edge" style={{ animationDelay: "240ms" }} d="M160,140 L160,240" />
            <path className="glassbox-edge" style={{ animationDelay: "300ms" }} d="M160,240 L65,190" />
            <path className="glassbox-edge" style={{ animationDelay: "360ms" }} d="M65,190 L65,90" />
            <path className="glassbox-edge" style={{ animationDelay: "300ms" }} d="M255,90 L255,190" />
            <path className="glassbox-edge" style={{ animationDelay: "360ms" }} d="M255,190 L160,240" />
          </g>

          {/* faint glass fill on the two visible faces for the see-through effect */}
          <polygon points="65,90 160,140 160,240 65,190" fill="var(--accent)" opacity="0.05" />
          <polygon points="255,90 160,140 160,240 255,190" fill="var(--accent)" opacity="0.03" />

          {/* decisions, committed one at a time, passing visibly through the box */}
          {[
            { color: "var(--status-approved)", begin: "0s" },
            { color: "var(--status-rejected)", begin: "1.1s" },
            { color: "var(--status-approved)", begin: "2.2s" },
            { color: "var(--status-hold)", begin: "3.3s" },
          ].map((particle, i) => (
            <circle key={i} r="4.5" fill={particle.color}>
              <animateMotion
                dur="4.4s"
                begin={particle.begin}
                repeatCount="indefinite"
                path="M160,0 L160,280"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;1;0"
                keyTimes="0;0.15;0.5;0.85;1"
                dur="4.4s"
                begin={particle.begin}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>

      <div className="relative flex max-w-2xl flex-col items-center gap-5">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Every decision your trading agent makes, committed onchain before it executes.
        </h1>
        <p className="text-lg text-muted-foreground">See it. Verify it. Trust it.</p>
        <a
          href="/feed"
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          View the live feed
        </a>
      </div>
    </section>
  );
}
