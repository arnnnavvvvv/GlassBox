from glassbox_agents import risk_agent

POLICY = {
    "version": "risk_v1",
    "maxPositionSize": 5000,
    "allowedSymbols": ["BTC-USD", "ETH-USD"],
    "rules": ["Reject anything over the cap.", "Only allowed symbols."],
}


def test_hard_rule_rejects_when_size_exceeds_cap_without_calling_llm():
    decision = {"agentId": "trading-agent-1", "symbol": "BTC-USD", "action": "buy", "size": 9999, "price": 100}
    verdict = risk_agent.evaluate(decision, POLICY)
    assert verdict["verdict"] == 0
    assert "cap" in verdict["reason"].lower()


def test_hard_rule_rejects_disallowed_symbol_without_calling_llm():
    decision = {"agentId": "trading-agent-1", "symbol": "DOGE-USD", "action": "buy", "size": 100, "price": 1}
    verdict = risk_agent.evaluate(decision, POLICY)
    assert verdict["verdict"] == 0
    assert "allowed" in verdict["reason"].lower()


def test_hold_is_approved_without_calling_llm():
    decision = {"agentId": "trading-agent-1", "symbol": "BTC-USD", "action": "hold", "size": 0, "price": 100}
    verdict = risk_agent.evaluate(decision, POLICY)
    assert verdict["verdict"] == 1


def test_within_cap_calls_llm_for_independent_verdict(monkeypatch):
    monkeypatch.setattr(
        risk_agent,
        "chat_json",
        lambda system, user, model=None: {"verdict": "approve", "reason": "within policy"},
    )
    decision = {"agentId": "trading-agent-1", "symbol": "BTC-USD", "action": "buy", "size": 1000, "price": 100}
    verdict = risk_agent.evaluate(decision, POLICY)
    assert verdict["verdict"] == 1
    assert verdict["reason"] == "within policy"


def test_llm_does_not_receive_trading_agent_reasoning(monkeypatch):
    captured = {}

    def fake_chat_json(system, user, model=None):
        captured["user"] = user
        return {"verdict": "approve", "reason": "ok"}

    monkeypatch.setattr(risk_agent, "chat_json", fake_chat_json)
    decision = {
        "agentId": "trading-agent-1",
        "symbol": "BTC-USD",
        "action": "buy",
        "size": 1000,
        "price": 100,
        "reasoning": "secret trading-agent reasoning that should never leak to the risk agent",
        "confidence": 0.9,
    }
    risk_agent.evaluate(decision, POLICY)
    assert "secret trading-agent reasoning" not in captured["user"]
