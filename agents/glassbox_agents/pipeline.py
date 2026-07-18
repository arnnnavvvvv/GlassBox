"""The full node graph: trading agent -> risk agent -> gate -> execution agent.

Deliberately a plain function chain rather than a full LangGraph dependency --
same node/state shape, no extra runtime weight for a demo this size.
"""

import json
from pathlib import Path

from . import risk_agent, trading_agent
from .execution import execute_trade

POLICY_PATH = Path(__file__).resolve().parent.parent / "policy.json"


def load_policy() -> dict:
    with open(POLICY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def run_tick(tick: dict, policy: dict = None) -> dict:
    """Runs one price tick through the full pipeline. Raises GateBlockedError
    (from glassbox_gate) if the onchain commit fails -- callers must not
    catch that and continue as if nothing happened."""
    policy = policy or load_policy()

    decision = trading_agent.propose(tick)
    risk_verdict = risk_agent.evaluate(decision, policy)
    execution = execute_trade(decision, risk_verdict)

    return {"decision": decision, "riskVerdict": risk_verdict, "execution": execution}
