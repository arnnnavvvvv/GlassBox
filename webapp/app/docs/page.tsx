import CodeBlock from "@/components/CodeBlock";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const EXPLORER_TX_URL = process.env.NEXT_PUBLIC_EXPLORER_TX_URL || "https://testnet.monadexplorer.com/tx";
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL;

const SECTIONS: [string, string][] = [
  ["what-it-verifies", "What it verifies"],
  ["integrate", "Integrate your agent"],
  ["hashing", "Canonical hashing"],
  ["api", "API reference"],
  ["contract", "Contract"],
];

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.8em] text-accent">{children}</code>
  );
}

function Section({
  index,
  id,
  title,
  children,
}: {
  index: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent">0{index}</span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight">Docs</h1>
        <p className="mt-3 text-muted-foreground">
          What GlassBox actually verifies, how to wire your own trading agent into it, and the
          exact hashing rules a stranger would need to check our work independently.
        </p>
      </div>

      <nav className="mb-12 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4 text-sm">
        {SECTIONS.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent">
            <span className="font-mono text-xs text-accent">0{i + 1}</span>
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-14">
        <Section index={1} id="what-it-verifies" title="What it verifies (and what it doesn't)">
          <p>
            GlassBox proves one specific thing: that a trading decision and an independent risk
            verdict existed, in exactly the form shown, before execution was allowed to proceed —
            and that nobody has edited that record since. Every hash on this site was produced by
            a real commit to Monad testnet; nothing here is simulated.
          </p>
          <p>
            It does <strong className="text-foreground">not</strong> broker real trades. In this
            reference build, the execution step (<InlineCode>place_order()</InlineCode>) is a
            clearly labeled stub that prints instead of calling an exchange — because the thing
            being proven (a real risk check ran and was committed first) is true regardless of
            what happens after the gate opens. A real integration replaces that one function with
            your actual exchange call; the commit-and-verify guarantee doesn&apos;t change.
          </p>
        </Section>

        <Section index={2} id="integrate" title="Integrate your agent">
          <p>
            The gate is a decorator, not a framework — it wraps the boundary between &quot;a
            decision was reached&quot; and &quot;an action executes.&quot; It doesn&apos;t inspect
            your trading logic or your risk logic. Wrap whatever function currently executes a
            trade, wherever that already happens in your pipeline:
          </p>
          <CodeBlock>{`pip install -e path/to/gate  # or from your fork's git URL

from glassbox_gate import onchain_gate

@onchain_gate(policy="your_policy_v1")
def execute_trade(decision, risk_verdict):
    if risk_verdict["verdict"] == 1:
        your_existing_place_order_function(decision)`}</CodeBlock>
          <p>
            Point it at a running GlassBox backend with <InlineCode>GLASSBOX_BACKEND_URL</InlineCode>.
            The gate canonicalizes your payload, posts it, waits for the commit to confirm, and
            raises <InlineCode>GateBlockedError</InlineCode> instead of calling your function if
            the commit fails — it never executes on a best-effort basis.
          </p>
          <p className="font-medium text-foreground">Required fields</p>
          <p>
            Only three fields are structurally required. Everything else is free-form — send
            whatever your agent actually has:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-accent/20 bg-accent/5 text-xs uppercase tracking-wide text-accent">
                <tr>
                  <th className="px-4 py-2 font-medium">Field</th>
                  <th className="px-4 py-2 font-medium">Required</th>
                  <th className="px-4 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2"><InlineCode>decision.agentId</InlineCode></td>
                  <td className="px-4 py-2 text-foreground">Yes</td>
                  <td className="px-4 py-2">Any string identifying your agent on the shared registry.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><InlineCode>decision.action</InlineCode></td>
                  <td className="px-4 py-2 text-foreground">Yes</td>
                  <td className="px-4 py-2">Whatever verb describes the decision — not limited to buy/sell/hold.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><InlineCode>riskVerdict.verdict</InlineCode></td>
                  <td className="px-4 py-2 text-foreground">Yes</td>
                  <td className="px-4 py-2"><InlineCode>0</InlineCode> (rejected) or <InlineCode>1</InlineCode> (approved).</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><InlineCode>decision.price</InlineCode></td>
                  <td className="px-4 py-2 text-muted-foreground">No</td>
                  <td className="px-4 py-2">If numeric and present, the feed plots it on the price chart. Omit it if it doesn&apos;t apply.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><InlineCode>anything else</InlineCode></td>
                  <td className="px-4 py-2 text-muted-foreground">No</td>
                  <td className="px-4 py-2">Stored and shown on the Verify modal exactly as sent, whatever the shape.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Today, integrating means self-hosting: you run your own instance of the backend (or
            point at one someone else runs) and either deploy your own contract or register your
            policy on a shared one. There&apos;s no hosted signup flow yet.
          </p>
        </Section>

        <Section index={3} id="hashing" title="Canonical hashing">
          <p>
            The whole Verify flow depends on two independent implementations producing byte
            -identical output. The rules, fixed and non-negotiable:
          </p>
          <ul className="list-inside list-disc space-y-1 marker:text-accent">
            <li>Object keys sorted alphabetically, recursively.</li>
            <li>Numbers rounded to 8 decimal places and serialized as fixed-point strings, never raw floats.</li>
            <li>Timestamps as ISO 8601, UTC, second precision (<InlineCode>YYYY-MM-DDTHH:MM:SSZ</InlineCode>).</li>
            <li>Compact JSON serialization — sorted keys, no incidental whitespace, raw UTF-8 (no <InlineCode>\u</InlineCode>-escaping).</li>
            <li>Hash = keccak256 of the UTF-8 bytes of that string, as a 0x-prefixed hex string.</li>
          </ul>
          <p>
            Reference implementations: <InlineCode>gate/glassbox_gate/canonical.py</InlineCode> (Python)
            and <InlineCode>webapp/lib/canonical.ts</InlineCode> (TypeScript). Reimplement this in
            any other language and you can verify a commit without trusting either of ours.
          </p>
        </Section>

        <Section index={4} id="api" title="API reference">
          <p>The backend exposes three endpoints:</p>
          <CodeBlock>{`POST /api/decisions
  body: canonical {decision, policy, riskVerdict, timestamp} payload
  → { id, onchainId, decisionHash, txHash, explorerUrl }
  Non-2xx means the commit failed -- the gate blocks on any non-2xx response.

GET /api/decisions
  → [{
      id, onchainId, agentId, action, verdict, price,
      decisionHash, txHash, explorerUrl, createdAt
    }]

GET /api/decisions/:id
  → same shape as above, plus the full raw "payload" used for Verify`}</CodeBlock>
        </Section>

        <Section index={5} id="contract" title="Contract">
          <p>
            Two mutating functions, no update or delete, ever: <InlineCode>registerPolicy(bytes32)</InlineCode>{" "}
            and <InlineCode>commitDecision(bytes32, string, uint8)</InlineCode>. The{" "}
            <InlineCode>agentId</InlineCode> parameter means this is a shared registry — any
            number of agents can commit to the same contract.
          </p>
          {CONTRACT_ADDRESS ? (
            <p>
              Deployed at{" "}
              <a
                href={`${EXPLORER_TX_URL.replace(/\/tx$/, "")}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-accent hover:underline"
              >
                {CONTRACT_ADDRESS}
              </a>{" "}
              on Monad testnet.
            </p>
          ) : (
            <p>Not yet deployed to a public network — see the repo for the deploy script.</p>
          )}
        </Section>

        {GITHUB_URL && (
          <p className="border-t border-border pt-8 text-sm text-muted-foreground">
            Source: <a href={GITHUB_URL} className="text-accent hover:underline">{GITHUB_URL}</a>
          </p>
        )}
      </div>
    </div>
  );
}
