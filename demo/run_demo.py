"""CLI runner for the recorded GlassBox demo.

Feeds demo/scenario.json through the real agents pipeline (trading agent ->
risk agent -> onchain gate -> execution agent) tick by tick, printing each
decision, verdict, and onchain commit proof as it happens. Uses the same
scripted scenario every run so the recorded demo hits the same beats
reliably across takes.
"""

import argparse
import json
import sys
import time
from pathlib import Path

AGENTS_DIR = Path(__file__).resolve().parents[1] / "agents"
sys.path.insert(0, str(AGENTS_DIR))

from glassbox_gate import GateBlockedError  # noqa: E402

from glassbox_agents.pipeline import load_policy, run_tick  # noqa: E402

SCENARIO_PATH = Path(__file__).resolve().parent / "scenario.json"


def verdict_label(verdict: int) -> str:
    return "APPROVED" if verdict == 1 else "REJECTED"


def run(delay_seconds: float):
    with open(SCENARIO_PATH, "r", encoding="utf-8") as f:
        scenario = json.load(f)

    policy = load_policy()
    print(f"Loaded policy {policy['version']} (max position size {policy['maxPositionSize']})\n")

    for i, tick in enumerate(scenario["ticks"], start=1):
        print(f"--- Tick {i}/{len(scenario['ticks'])}: {tick['symbol']} @ {tick['price']} ---")
        if tick.get("note"):
            print(f"  {tick['note']}")

        try:
            result = run_tick(tick, policy)
        except GateBlockedError as exc:
            print(f"\n!! GATE BLOCKED: {exc}")
            print("!! Execution halted -- a decision could not be confirmed onchain.")
            sys.exit(1)

        decision = result["decision"]
        risk_verdict = result["riskVerdict"]
        commit = result["commit"]

        print(f"  Trading agent proposal: {decision['action']} ${decision['size']} (confidence {decision['confidence']})")
        print(f"    reasoning: {decision['reasoning']}")
        print(f"  Risk verdict: {verdict_label(risk_verdict['verdict'])} -- {risk_verdict['reason']}")
        print(f"  Executed: {result['execution']['executed']}")
        if commit:
            print(f"  Committed onchain: {commit['txHash']}")
            print(f"  Decision hash: {commit['decisionHash']}")
        print()

        if i < len(scenario["ticks"]):
            time.sleep(delay_seconds)

    print("Demo complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the scripted GlassBox demo scenario.")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds to pause between ticks.")
    args = parser.parse_args()
    run(args.delay)
