from datetime import datetime, timezone

from glassbox_gate.canonical import canonical_json, canonicalize_decision, hash_payload


def test_key_ordering_is_alphabetical_and_recursive():
    payload = canonicalize_decision(
        decision={"symbol": "BTC-USD", "action": "buy", "size": 1000},
        risk_verdict={"verdict": 1, "reason": "within cap"},
        policy="risk_v1",
        timestamp="2026-07-19T12:00:00Z",
    )
    serialized = canonical_json(payload)
    assert serialized.index('"decision"') < serialized.index('"policy"')
    assert serialized.index('"policy"') < serialized.index('"riskVerdict"')
    assert serialized.index('"riskVerdict"') < serialized.index('"timestamp"')
    assert serialized.index('"action"') < serialized.index('"size"') < serialized.index('"symbol"')


def test_no_whitespace_in_serialization():
    payload = canonicalize_decision({"a": 1}, {"verdict": 0}, "risk_v1", "2026-07-19T12:00:00Z")
    serialized = canonical_json(payload)
    assert " " not in serialized


def test_numbers_are_fixed_precision_and_float_safe():
    payload_a = canonicalize_decision({"size": 0.1 + 0.2}, {"verdict": 1}, "risk_v1", "2026-07-19T12:00:00Z")
    payload_b = canonicalize_decision({"size": 0.3}, {"verdict": 1}, "risk_v1", "2026-07-19T12:00:00Z")
    assert canonical_json(payload_a) == canonical_json(payload_b)


def test_timestamp_normalizes_to_second_precision_utc():
    dt = datetime(2026, 7, 19, 12, 0, 0, 123456, tzinfo=timezone.utc)
    payload = canonicalize_decision({}, {"verdict": 1}, "risk_v1", dt)
    assert payload["timestamp"] == "2026-07-19T12:00:00Z"


def test_hash_is_deterministic_across_equivalent_input_shapes():
    payload_a = canonicalize_decision(
        {"symbol": "BTC-USD", "size": 1000}, {"verdict": 1}, "risk_v1", "2026-07-19T12:00:00Z"
    )
    payload_b = canonicalize_decision(
        {"size": 1000, "symbol": "BTC-USD"}, {"verdict": 1}, "risk_v1", "2026-07-19T12:00:00Z"
    )
    assert hash_payload(payload_a) == hash_payload(payload_b)
    assert hash_payload(payload_a).startswith("0x")
    assert len(hash_payload(payload_a)) == 66  # 0x + 64 hex chars = bytes32


def test_hash_changes_if_any_value_changes():
    base = canonicalize_decision({"size": 1000}, {"verdict": 1}, "risk_v1", "2026-07-19T12:00:00Z")
    tampered = canonicalize_decision({"size": 1000.01}, {"verdict": 1}, "risk_v1", "2026-07-19T12:00:00Z")
    assert hash_payload(base) != hash_payload(tampered)
