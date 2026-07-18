"use client";

import { useEffect, useState } from "react";
import { fetchDecision } from "@/lib/api";
import { hashPayload } from "@/lib/canonical";
import { readOnchainDecision, type OnchainDecision } from "@/lib/chain";
import type { DecisionDetail } from "@/lib/types";

interface State {
  loading: boolean;
  error: string | null;
  detail: DecisionDetail | null;
  onchain: OnchainDecision | null;
  recomputedHash: string | null;
}

export default function VerifyModal({ decisionId, onClose }: { decisionId: number; onClose: () => void }) {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    detail: null,
    onchain: null,
    recomputedHash: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const detail = await fetchDecision(decisionId);
        const recomputedHash = hashPayload(detail.payload);
        const onchain = await readOnchainDecision(detail.onchainId);
        if (!cancelled) {
          setState({ loading: false, error: null, detail, onchain, recomputedHash });
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: (err as Error).message }));
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [decisionId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const verified =
    state.recomputedHash && state.onchain && state.recomputedHash.toLowerCase() === state.onchain.decisionHash.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-surface-raised p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Verify decision #{decisionId}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            ✕
          </button>
        </div>

        {state.loading && <div className="py-10 text-center text-sm text-muted-foreground">Reading Monad via RPC…</div>}

        {state.error && (
          <div className="rounded-md border border-status-rejected/30 bg-status-rejected/10 p-4 text-sm text-status-rejected">
            Could not complete verification: {state.error}
          </div>
        )}

        {!state.loading && !state.error && state.detail && state.onchain && (
          <div className="space-y-5">
            <div
              className={`rounded-md px-4 py-3 text-sm font-medium ${
                verified ? "bg-status-approved/15 text-status-approved" : "bg-status-rejected/15 text-status-rejected"
              }`}
            >
              {verified ? "Verified — hashes match" : "Mismatch — hashes do not match"}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Decision payload
              </h3>
              <dl className="grid grid-cols-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Action</dt>
                <dd className="col-span-2">
                  {state.detail.payload.decision.action} {state.detail.payload.decision.symbol}
                </dd>
                <dt className="text-muted-foreground">Trading reasoning</dt>
                <dd className="col-span-2">{state.detail.payload.decision.reasoning}</dd>
                <dt className="text-muted-foreground">Risk verdict</dt>
                <dd className="col-span-2">{state.detail.payload.riskVerdict.reason}</dd>
                <dt className="text-muted-foreground">Policy version</dt>
                <dd className="col-span-2 font-mono text-xs">{state.detail.payload.policy}</dd>
              </dl>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hash comparison
              </h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="rounded-md border border-border bg-surface p-3">
                  <div className="mb-1 text-muted-foreground">Recomputed client-side from fetched payload</div>
                  <div className="break-all">{state.recomputedHash}</div>
                </div>
                <div className="rounded-md border border-border bg-surface p-3">
                  <div className="mb-1 text-muted-foreground">Read directly from Monad via RPC</div>
                  <div className="break-all">{state.onchain.decisionHash}</div>
                </div>
              </div>
            </div>

            <a
              href={state.detail.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              View transaction on Monad explorer ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
