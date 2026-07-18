import importlib
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from glassbox_gate.canonical import canonicalize_decision


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("GLASSBOX_DB_PATH", str(tmp_path / "test.db"))

    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    for mod in list(sys.modules):
        if mod == "app" or mod.startswith("app."):
            del sys.modules[mod]

    from app import chain, config, main

    importlib.reload(config)

    monkeypatch.setattr(
        chain,
        "commit_decision",
        lambda decision_hash, agent_id, verdict: {"txHash": "0xabc123", "onchainId": 0},
    )

    with TestClient(main.app) as test_client:
        yield test_client


def sample_payload():
    return canonicalize_decision(
        decision={
            "agentId": "trading-agent-1",
            "action": "buy",
            "symbol": "BTC-USD",
            "size": 1200,
        },
        risk_verdict={"verdict": 1, "reason": "within cap"},
        policy="risk_v1",
        timestamp="2026-07-19T12:00:00Z",
    )


def test_create_decision_commits_and_returns_hash(client):
    response = client.post("/api/decisions", json=sample_payload())
    assert response.status_code == 200
    body = response.json()
    assert body["txHash"] == "0xabc123"
    assert body["decisionHash"].startswith("0x")
    assert len(body["decisionHash"]) == 66


def test_list_and_get_decision_round_trip(client):
    create = client.post("/api/decisions", json=sample_payload())
    decision_id = create.json()["id"]

    listing = client.get("/api/decisions")
    assert listing.status_code == 200
    assert any(d["id"] == decision_id for d in listing.json())

    detail = client.get(f"/api/decisions/{decision_id}")
    assert detail.status_code == 200
    assert detail.json()["payload"]["decision"]["symbol"] == "BTC-USD"


def test_get_missing_decision_is_404(client):
    response = client.get("/api/decisions/999")
    assert response.status_code == 404


def test_rejected_verdict_still_commits(client):
    payload = canonicalize_decision(
        decision={"agentId": "trading-agent-1", "action": "buy", "size": 9999},
        risk_verdict={"verdict": 0, "reason": "exceeds position size cap"},
        policy="risk_v1",
        timestamp="2026-07-19T12:00:00Z",
    )
    response = client.post("/api/decisions", json=payload)
    assert response.status_code == 200
    assert response.json()["decisionHash"]


def test_chain_failure_returns_502_not_200(client, monkeypatch):
    from app import chain

    def boom(*args, **kwargs):
        raise RuntimeError("rpc timeout")

    monkeypatch.setattr(chain, "commit_decision", boom)

    response = client.post("/api/decisions", json=sample_payload())
    assert response.status_code == 502
