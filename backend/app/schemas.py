from typing import Any

from pydantic import BaseModel


class DecisionPayload(BaseModel):
    """The canonical {decision, policy, riskVerdict, timestamp} shape produced
    by glassbox_gate.canonicalize_decision. Pydantic validates shape; the
    backend re-derives the hash itself rather than trusting a caller-supplied one.
    """

    decision: dict[str, Any]
    policy: str
    riskVerdict: dict[str, Any]
    timestamp: str


class CommitResponse(BaseModel):
    id: int
    onchainId: int
    decisionHash: str
    txHash: str
    explorerUrl: str


class DecisionSummary(BaseModel):
    id: int
    onchainId: int
    agentId: str
    action: str
    verdict: int
    decisionHash: str
    txHash: str
    explorerUrl: str
    createdAt: str


class DecisionDetail(DecisionSummary):
    payload: dict[str, Any]
