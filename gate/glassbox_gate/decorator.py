"""The gate: the reusable boundary between "a decision was reached" and "an
action executes." It does not know anything about trading or risk-agent
logic -- it only canonicalizes, commits, and blocks on failure.
"""

import functools
import os
from datetime import datetime, timezone
from typing import Callable

import requests

from .canonical import canonicalize_decision, hash_payload

DEFAULT_BACKEND_URL = "http://localhost:8000"


class GateBlockedError(RuntimeError):
    """Raised when a decision could not be confirmed onchain.

    Execution must never proceed past this -- the whole premise of GlassBox
    is that the commit is a precondition for the trade, never best-effort.
    """


def onchain_gate(policy: str, backend_url: str = None, timeout_seconds: float = 30.0):
    """Wraps a function so it only runs after its decision + risk verdict has
    been committed onchain. The wrapped function receives (decision, risk_verdict)
    plus whatever else it was called with; it decides what "execute" means
    (e.g. only place an order when the verdict is approved) -- the gate itself
    does not branch on verdict content, only on whether the commit succeeded.
    """

    def decorator(fn: Callable):
        @functools.wraps(fn)
        def wrapper(decision: dict, risk_verdict: dict, *args, **kwargs):
            url = backend_url or os.environ.get("GLASSBOX_BACKEND_URL", DEFAULT_BACKEND_URL)
            timestamp = datetime.now(timezone.utc)
            payload = canonicalize_decision(decision, risk_verdict, policy, timestamp)
            expected_hash = hash_payload(payload)

            try:
                response = requests.post(
                    f"{url}/api/decisions",
                    json=payload,
                    timeout=timeout_seconds,
                )
                response.raise_for_status()
                result = response.json()
            except requests.RequestException as exc:
                raise GateBlockedError(f"onchain commit request failed: {exc}") from exc

            if result.get("decisionHash") != expected_hash:
                raise GateBlockedError(
                    "backend's decisionHash does not match the locally computed "
                    "canonical hash -- refusing to execute"
                )

            if not result.get("txHash"):
                raise GateBlockedError("backend did not confirm an onchain commit -- refusing to execute")

            # Stashed on the wrapper (not the return value) so the documented
            # `execute_trade(decision, risk_verdict)` calling convention is
            # unaffected; callers who want commit proof can read
            # `execute_trade.last_commit` right after calling.
            wrapper.last_commit = result

            return fn(decision, risk_verdict, *args, **kwargs)

        wrapper.last_commit = None
        return wrapper

    return decorator
