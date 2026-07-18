"""Trading agent node: proposes an action for a single price tick.

Only action/size/confidence/reasoning come from the LLM -- symbol, price,
and agentId are attached deterministically from the tick itself so the
committed record can't drift from the actual scripted input.
"""

from .llm import chat_json

AGENT_ID = "trading-agent-1"

SYSTEM_PROMPT = """You are an autonomous crypto trading agent. Given the current \
price and recent price history for a symbol, propose exactly one action.

Respond with a JSON object with these exact keys:
  "action": one of "buy", "sell", "hold"
  "size": a positive number, the proposed position size in USD (0 if action is "hold")
  "confidence": a number between 0 and 1
  "reasoning": a short (1-2 sentence) explanation of your proposal based on the price data

Base your proposal on momentum and volatility in the provided price history. \
Do not mention risk limits or position caps -- that is a separate agent's job."""


def propose(tick: dict) -> dict:
    user_prompt = (
        f"Symbol: {tick['symbol']}\n"
        f"Current price: {tick['price']}\n"
        f"Recent price history (oldest to newest): {tick.get('priceHistory', [])}"
    )
    proposal = chat_json(SYSTEM_PROMPT, user_prompt)

    return {
        "agentId": AGENT_ID,
        "symbol": tick["symbol"],
        "price": tick["price"],
        "action": proposal["action"],
        "size": proposal.get("size", 0) if proposal["action"] != "hold" else 0,
        "confidence": proposal.get("confidence", 0),
        "reasoning": proposal.get("reasoning", ""),
    }
