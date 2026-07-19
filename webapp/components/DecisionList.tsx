"use client";

import type { DecisionSummary } from "@/lib/types";
import VerdictBadge from "./VerdictBadge";

function formatTime(iso: string): string {
  // Fixed locale (not `undefined`) so server render and client hydration
  // produce identical text -- the runtime's default locale can otherwise
  // differ between Node (server) and the browser (client).
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DecisionList({
  decisions,
  onVerify,
  onSelectAgent,
}: {
  decisions: DecisionSummary[];
  onVerify: (id: number) => void;
  onSelectAgent?: (agentId: string) => void;
}) {
  const sorted = [...decisions].sort((a, b) => b.id - a.id);

  return (
    <div className="max-h-[520px] divide-y divide-border overflow-y-auto rounded-lg border border-border bg-surface">
      {sorted.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No decisions committed yet.</div>
      )}
      {sorted.map((d) => (
        <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground">#{d.id}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {onSelectAgent ? (
                  <button
                    onClick={() => onSelectAgent(d.agentId)}
                    className="font-medium transition-colors hover:text-accent"
                    title={`View only ${d.agentId}`}
                  >
                    {d.agentId}
                  </button>
                ) : (
                  <span className="font-medium">{d.agentId}</span>
                )}
                <span className="text-sm text-muted-foreground">{d.action}</span>
              </div>
              <div className="mt-0.5 font-mono text-xs text-muted-foreground">{formatTime(d.createdAt)}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <VerdictBadge verdict={d.verdict} />
            <button
              onClick={() => onVerify(d.id)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Verify
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
