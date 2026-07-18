// A "hold" action carries no position risk and always auto-approves, so it
// gets its own neutral marker color distinct from an actual approved/rejected buy or sell.
export function markerColor(action: string, verdict: number): string {
  if (action === "hold") return "var(--status-hold)";
  return verdict === 1 ? "var(--status-approved)" : "var(--status-rejected)";
}
