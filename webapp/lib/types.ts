export type Verdict = 0 | 1;

// Only agentId is structurally required by the backend (see backend/app/main.py).
// Everything else is free-form -- any agent's decision/verdict shape is valid,
// so the UI must not assume trading-specific fields like "symbol" or "price" exist.
export interface DecisionPayload {
  decision: { agentId: string; action: string } & Record<string, unknown>;
  policy: string;
  riskVerdict: { verdict: string } & Record<string, unknown>;
  timestamp: string;
}

export interface DecisionSummary {
  id: number;
  onchainId: number;
  agentId: string;
  action: string;
  verdict: Verdict;
  price: string | null;
  decisionHash: string;
  txHash: string;
  explorerUrl: string;
  createdAt: string;
}

export interface DecisionDetail extends DecisionSummary {
  payload: DecisionPayload;
}
