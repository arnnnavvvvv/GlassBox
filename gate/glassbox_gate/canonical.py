"""Canonical hashing spec for GlassBox decision payloads (AGENT.md §5).

This is the single source of truth for how a decision payload is turned into
deterministic bytes and hashed. It is used by both the gate (to canonicalize
before sending) and the backend (to recompute the same hash before commit).
The webapp mirrors this exact logic in TypeScript at
webapp/lib/canonical.ts -- if you change anything here, change it there too.

Rules, fixed and non-negotiable:
  1. Key ordering: alphabetical, recursively, always.
  2. Numbers: rounded to NUMBER_PRECISION decimal places and serialized as
     fixed-point strings (never raw floats) -- this is what avoids float
     round-trip drift between Python, JS, and Solidity tooling.
  3. Timestamps: ISO 8601, UTC, second precision -- "YYYY-MM-DDTHH:MM:SSZ".
  4. Serialization: JSON with sorted keys and no incidental whitespace
     (separators=(",", ":")).
  5. Hash: keccak256 of the UTF-8 bytes of that canonical JSON string,
     returned as a 0x-prefixed hex string (a Solidity bytes32).
"""

import json
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Union

from eth_utils import keccak

NUMBER_PRECISION = 8


def _round_number(value: Union[int, float, Decimal]) -> str:
    quantum = Decimal(1).scaleb(-NUMBER_PRECISION)
    d = Decimal(str(value)).quantize(quantum, rounding=ROUND_HALF_UP)
    return format(d, "f")


def format_timestamp(value: Union[str, datetime]) -> str:
    """Normalize any timestamp input to UTC, second precision, ISO 8601 with a Z suffix."""
    if isinstance(value, str):
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    else:
        dt = value
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    dt = dt.astimezone(timezone.utc).replace(microsecond=0)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _canonicalize_value(value: Any) -> Any:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float, Decimal)):
        return _round_number(value)
    if isinstance(value, dict):
        return {key: _canonicalize_value(value[key]) for key in sorted(value.keys())}
    if isinstance(value, (list, tuple)):
        return [_canonicalize_value(item) for item in value]
    return value


def canonicalize(value: Any) -> Any:
    """Generic canonicalization (recursive key sort + fixed-precision numbers)
    for any JSON-like value -- used for decision payloads and also for
    one-off objects like a risk policy document before hashing it for
    registerPolicy()."""
    return _canonicalize_value(value)


def canonicalize_decision(
    decision: dict, risk_verdict: dict, policy: str, timestamp: Union[str, datetime]
) -> dict:
    """Builds the canonical {decision, policy, riskVerdict, timestamp} payload."""
    payload = {
        "decision": decision,
        "policy": policy,
        "riskVerdict": risk_verdict,
        "timestamp": format_timestamp(timestamp),
    }
    return _canonicalize_value(payload)


def canonical_json(payload: dict) -> str:
    """Deterministic JSON serialization: sorted keys, no whitespace, raw UTF-8
    (ensure_ascii=False) -- this must match JS's JSON.stringify byte-for-byte,
    which does not \\uXXXX-escape non-ASCII characters either."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def hash_payload(payload: dict) -> str:
    """Returns the 0x-prefixed keccak256 hex digest of a canonicalized payload."""
    raw = canonical_json(payload).encode("utf-8")
    return "0x" + keccak(raw).hex()


def hash_decision(decision: dict, risk_verdict: dict, policy: str, timestamp: Union[str, datetime]) -> tuple:
    """Convenience: canonicalize + hash in one call. Returns (payload, hash)."""
    payload = canonicalize_decision(decision, risk_verdict, policy, timestamp)
    return payload, hash_payload(payload)
