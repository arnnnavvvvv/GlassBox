# GlassBox Agents

A small pipeline: trading agent -> risk agent -> onchain gate -> execution agent.

- **Trading agent** (`trading_agent.py`) -- an LLM call that proposes an
  action (buy/sell/hold, size, confidence, reasoning) from a price tick.
- **Risk agent** (`risk_agent.py`) -- an *independent* LLM call that sees
  only the proposed action and the active policy, never the trading agent's
  reasoning. A deterministic hard rule (position size cap + allowed symbol
  list) is checked first and short-circuits the LLM entirely -- this is
  what gives the demo a guaranteed, reproducible rejection.
- **Gate** (`execution.py`) -- `execute_trade` is wrapped in
  `glassbox_gate.onchain_gate`, so every decision (approved or rejected) is
  committed to Monad before this function's body runs, and never runs at
  all if the commit fails.

```python
from glassbox_agents import run_tick

result = run_tick({"symbol": "BTC-USD", "price": 43000.0, "priceHistory": [...]})
```

## Setup

```bash
pip install -r requirements.txt
```

Env vars (see `.env.example` at repo root):
- `GROQ_API_KEY` -- required for both agent LLM calls
- `GROQ_MODEL` -- defaults to `llama-3.3-70b-versatile`
- `GLASSBOX_BACKEND_URL` -- defaults to `http://localhost:8000`

The active policy lives in `policy.json` at the repo root of this package
directory; register it onchain once via `backend/scripts/register_policy.py`
whenever it changes.
