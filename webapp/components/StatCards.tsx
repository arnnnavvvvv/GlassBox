import type { DecisionSummary } from "@/lib/types";

export default function StatCards({ decisions }: { decisions: DecisionSummary[] }) {
  const total = decisions.length;
  const approved = decisions.filter((d) => d.verdict === 1).length;
  const blocked = decisions.filter((d) => d.verdict === 0).length;

  const cards = [
    { label: "Decisions committed", value: total, className: "text-foreground" },
    { label: "Approved", value: approved, className: "text-status-approved" },
    { label: "Blocked by risk gate", value: blocked, className: "text-status-rejected" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-surface p-5">
          <div className={`font-mono text-3xl font-semibold ${card.className}`}>{card.value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
