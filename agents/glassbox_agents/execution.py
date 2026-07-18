"""Execution agent node: the only place that actually "acts" on a decision.

Wrapped by the onchain gate, so for every decision -- approved or rejected --
the commit to Monad happens first and must succeed before this function's
body runs at all. The gate itself doesn't know what "approved" means; that
branch lives here.
"""

from glassbox_gate import onchain_gate


def place_order(decision: dict) -> None:
    # Simulated execution for the demo -- a real system would call an
    # exchange API here. Never fabricate a fill; this is a clearly-labeled stub.
    print(
        f"[execution] placing order: {decision['action']} {decision['size']} "
        f"{decision['symbol']} @ {decision['price']}"
    )


@onchain_gate(policy="risk_v1")
def execute_trade(decision: dict, risk_verdict: dict) -> dict:
    if risk_verdict["verdict"] == 1 and decision["action"] != "hold":
        place_order(decision)
        return {"executed": True}
    return {"executed": False}
