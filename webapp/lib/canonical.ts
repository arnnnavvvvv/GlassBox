/**
 * Mirrors gate/glassbox_gate/canonical.py exactly (AGENT.md §5). If you
 * change one, change the other.
 *
 * By the time a decision payload reaches this file (fetched from
 * GET /api/decisions/:id), its numbers have already been converted to
 * fixed-precision strings by the gate before it was ever sent over the
 * wire -- so recompute here only needs to: recursively sort object keys,
 * serialize compactly (no incidental whitespace), and keccak256 the UTF-8
 * bytes. The number-rounding branch below only matters if this function is
 * ever used to canonicalize a payload built fresh in JS (raw number
 * literals), which the Verify flow itself never does.
 */
import { keccak256, stringToBytes } from "viem";

const NUMBER_PRECISION = 8;

function roundNumber(value: number): string {
  return value.toFixed(NUMBER_PRECISION);
}

function canonicalizeValue(value: unknown): unknown {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return roundNumber(value);
  if (Array.isArray(value)) return value.map(canonicalizeValue);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = canonicalizeValue((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function canonicalize(value: unknown): unknown {
  return canonicalizeValue(value);
}

/** Deterministic JSON serialization: sorted keys, no whitespace, raw UTF-8 --
 * matches Python's json.dumps(sort_keys=True, separators=(",", ":"), ensure_ascii=False). */
export function canonicalJson(payload: unknown): string {
  return JSON.stringify(canonicalizeValue(payload));
}

/** Returns the 0x-prefixed keccak256 hex digest of a canonicalized payload. */
export function hashPayload(payload: unknown): `0x${string}` {
  return keccak256(stringToBytes(canonicalJson(payload)));
}
