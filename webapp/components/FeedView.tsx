"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DecisionSummary } from "@/lib/types";
import StatCards from "./StatCards";
import PriceChart from "./PriceChart";
import DecisionList from "./DecisionList";
import VerifyModal from "./VerifyModal";

export default function FeedView({ decisions }: { decisions: DecisionSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(searchParams.get("agent"));
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const agents = useMemo(
    () => Array.from(new Set(decisions.map((d) => d.agentId))).sort(),
    [decisions],
  );

  const filtered = selectedAgent ? decisions.filter((d) => d.agentId === selectedAgent) : decisions;

  function selectAgent(agentId: string | null) {
    setSelectedAgent(agentId);
    const params = new URLSearchParams();
    if (agentId) params.set("agent", agentId);
    router.replace(params.size ? `/feed?${params}` : "/feed", { scroll: false });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {selectedAgent ?? "Global feed"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedAgent
              ? `Showing only decisions committed by ${selectedAgent}. Every hash is still checkable directly against Monad.`
              : "Every row below is read from our database, but every hash is checkable directly against Monad."}
          </p>
        </div>

        {agents.length > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="agent-filter" className="text-muted-foreground">
              Agent
            </label>
            <select
              id="agent-filter"
              value={selectedAgent ?? ""}
              onChange={(e) => selectAgent(e.target.value || null)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
            >
              <option value="">Global feed (all agents)</option>
              {agents.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <StatCards decisions={filtered} />
      {filtered.some((d) => d.price !== null) && <PriceChart decisions={filtered} />}
      <DecisionList decisions={filtered} onVerify={setVerifyingId} onSelectAgent={selectAgent} />

      {verifyingId !== null && (
        <VerifyModal decisionId={verifyingId} onClose={() => setVerifyingId(null)} />
      )}
    </div>
  );
}
