# glassbox-gate

The reusable boundary between "a decision was reached" and "an action executes."

```python
from glassbox_gate import onchain_gate

@onchain_gate(policy="risk_v1")
def execute_trade(decision, risk_verdict):
    if risk_verdict["verdict"] == 1:
        place_order(decision)
```

`onchain_gate`:
1. Canonicalizes `{decision, riskVerdict, policy, timestamp}` (see `glassbox_gate/canonical.py`).
2. POSTs the canonical payload to the backend's `/api/decisions` endpoint.
3. Waits for the backend to confirm the Monad commit succeeded and that the
   returned `decisionHash` matches the hash computed locally.
4. Only then calls the wrapped function. If the commit fails, times out, or
   the hash disagrees, it raises `GateBlockedError` instead of executing.

The gate does not know what "approved" or "rejected" means for your business
logic -- every decision gets committed onchain regardless of verdict, so
rejections are just as tamper-evident as approvals. Whether to act on an
approval is up to the wrapped function.

Env vars: `GLASSBOX_BACKEND_URL` (default `http://localhost:8000`).

## Install

```bash
pip install -e .
```
