"use client";

import { useState } from "react";
import type { DecisionSummary } from "@/lib/types";
import StatCards from "./StatCards";
import PriceChart from "./PriceChart";
import DecisionList from "./DecisionList";
import VerifyModal from "./VerifyModal";

export default function FeedView({ decisions }: { decisions: DecisionSummary[] }) {
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Global feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every row below is read from our database, but every hash is checkable directly against Monad.
        </p>
      </div>

      <StatCards decisions={decisions} />
      <PriceChart decisions={decisions} />
      <DecisionList decisions={decisions} onVerify={setVerifyingId} />

      {verifyingId !== null && (
        <VerifyModal decisionId={verifyingId} onClose={() => setVerifyingId(null)} />
      )}
    </div>
  );
}
