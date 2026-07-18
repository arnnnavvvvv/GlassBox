export type Verdict = 0 | 1;

export interface DecisionPayload {
  decision: {
    agentId: string;
    action: "buy" | "sell" | "hold";
    symbol: string;
    price: string;
    size: string;
    confidence: string;
    reasoning: string;
  };
  policy: string;
  riskVerdict: {
    verdict: string;
    reason: string;
  };
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
