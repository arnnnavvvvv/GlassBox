"""Risk agent node: an independent verdict on a trading agent's proposal.

Deliberately does not receive the trading agent's reasoning or confidence --
only the proposed action and the active policy. A deterministic hard rule
(position size cap + allowed symbols) is checked first and short-circuits
the LLM call entirely, guaranteeing a reproducible rejection whenever a
proposal exceeds the cap, independent of any LLM's variability.
"""

from .llm import chat_json

SYSTEM_PROMPT = """You are an independent risk-review agent for a trading system. \
You are given a proposed trade action and the active risk policy. You do NOT know \
why the trading agent proposed it -- judge only whether the action is consistent \
with the policy rules.

Respond with a JSON object with these exact keys:
  "verdict": either "approve" or "reject"
  "reason": a short (1 sentence) justification"""


def evaluate(decision: dict, policy: dict) -> dict:
    if decision["action"] == "hold":
        return {"verdict": 1, "reason": "Hold proposals carry no position risk."}

    if decision["size"] > policy["maxPositionSize"]:
        return {
            "verdict": 0,
            "reason": (
                f"Hard rule violation: proposed size {decision['size']} exceeds "
                f"policy cap {policy['maxPositionSize']}."
            ),
        }

    if decision["symbol"] not in policy["allowedSymbols"]:
        return {
            "verdict": 0,
            "reason": f"Hard rule violation: {decision['symbol']} is not in the allowed symbol list.",
        }

    user_prompt = (
        f"Proposed action: {decision['action']}\n"
        f"Symbol: {decision['symbol']}\n"
        f"Size (USD): {decision['size']}\n"
        f"Price: {decision['price']}\n"
        f"Policy version: {policy['version']}\n"
        f"Policy rules:\n- " + "\n- ".join(policy["rules"])
    )
    result = chat_json(SYSTEM_PROMPT, user_prompt)
    verdict = 1 if result.get("verdict") == "approve" else 0
    return {"verdict": verdict, "reason": result.get("reason", "")}
