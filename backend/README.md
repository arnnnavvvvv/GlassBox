# GlassBox Backend

FastAPI service that stores decision payloads, commits their canonical hash
to Monad, and serves raw payloads back for the webapp's Verify flow.

## Endpoints

- `POST /api/decisions` -- body is the canonical `{decision, policy, riskVerdict, timestamp}`
  payload (as produced by `glassbox_gate`). Recomputes the hash itself (never
  trusts a caller-supplied hash), submits `commitDecision()` to Monad, waits
  for the receipt, and only returns 200 once the commit is confirmed. Any
  failure -- RPC error, revert, timeout -- returns a non-2xx response so the
  gate blocks execution.
- `GET /api/decisions` -- summary list for the feed.
- `GET /api/decisions/:id` -- full raw payload, used to recompute the hash client-side.

## Setup

```bash
pip install -r requirements.txt
```

Requires (see `.env.example` at repo root):
- `MONAD_RPC_URL`, `MONAD_CHAIN_ID`
- `BACKEND_WALLET_PRIVATE_KEY` -- lives only here, never in the repo or on the machine running the agent pipeline
- A deployment at `../contracts/deployments/<network>.json` (produced by `npm run deploy:monad` in `/contracts`)

Storage: decisions are stored in SQLite (`GLASSBOX_DB_PATH`, local file) by
default -- fine for local dev, but hosts with ephemeral disk (Render's free
tier, notably) wipe that file on every restart. Set `DATABASE_URL` to a
Postgres connection string (e.g. a free Neon project) to use that instead;
when it's set, Postgres is used unconditionally and `GLASSBOX_DB_PATH` is
ignored.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## One-time setup: register the risk policy

```bash
python -m scripts.register_policy
```

Hashes `agents/policy.json` with the same canonical hashing used for
decisions and calls `registerPolicy()`. Re-run whenever the policy changes.
