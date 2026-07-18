import type { DecisionDetail, DecisionSummary } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchDecisions(): Promise<DecisionSummary[]> {
  const res = await fetch(`${BACKEND_URL}/api/decisions`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch decisions: ${res.status}`);
  return res.json();
}

export async function fetchDecision(id: number): Promise<DecisionDetail> {
  const res = await fetch(`${BACKEND_URL}/api/decisions/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch decision ${id}: ${res.status}`);
  return res.json();
}
