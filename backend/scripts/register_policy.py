"""One-time admin action: hash the active risk policy and register it onchain
via GlassBox.registerPolicy(). Run whenever agents/policy.json changes.

Usage: python -m scripts.register_policy
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from glassbox_gate.canonical import canonical_json, canonicalize, hash_payload

from app import chain, config

POLICY_PATH = config.REPO_ROOT / "agents" / "policy.json"


def main():
    with open(POLICY_PATH, "r", encoding="utf-8") as f:
        policy = json.load(f)

    canonical = canonicalize(policy)
    policy_hash = hash_payload(canonical)

    print(f"Policy version: {policy.get('version')}")
    print(f"Canonical JSON: {canonical_json(canonical)}")
    print(f"Policy hash:    {policy_hash}")

    result = chain.register_policy(policy_hash)
    print(f"Registered onchain. txHash: {result['txHash']}")


if __name__ == "__main__":
    main()
