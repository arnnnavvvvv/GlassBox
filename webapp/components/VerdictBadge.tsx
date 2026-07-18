import type { Verdict } from "@/lib/types";

const STYLES: Record<Verdict, { label: string; className: string }> = {
  1: { label: "Approved", className: "bg-status-approved/15 text-status-approved" },
  0: { label: "Rejected", className: "bg-status-rejected/15 text-status-rejected" },
};

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const style = STYLES[verdict];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}
