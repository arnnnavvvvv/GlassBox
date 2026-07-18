# GlassBox

**See it. Verify it. Trust it.**

Every decision a trading agent makes — the trading agent's proposal and an
independent risk agent's verdict — is hashed and committed to an
append-only smart contract on Monad testnet *before* execution is allowed
to proceed. A public viewer reads directly from the chain, recomputes the
hash client-side, and confirms the stored record hasn't been altered since
the commit. Edit the record after the fact and the hashes stop matching,
visibly, to anyone.

AI trading agents already produce "audit trails," but those trails are
self-declared and editable by the same party being audited. GlassBox
replaces "trust our database" with "check the chain yourself."

## How it works

1. **Propose** — a trading agent proposes an action; an independent risk
   agent evaluates it against policy without seeing the trading agent's
   reasoning, plus one deterministic hard rule (a position size cap).
2. **Commit** — both are hashed (canonical, deterministic serialization)
   and committed onchain. If the commit fails, execution does not proceed.
3. **Verify** — anyone with the contract address and ABI can recompute the
   hash from the raw record and compare it to what's onchain, independent
   of this project's frontend or database.

## Layout

| Path | What it is |
|---|---|
| `contracts/` | `GlassBox.sol` (Hardhat), deploy script, deployed address + ABI |
| `gate/` | `glassbox-gate` — the reusable commit-and-block SDK |
| `agents/` | Trading agent → risk agent → gate → execution agent pipeline |
| `backend/` | FastAPI service: stores payloads, commits to Monad, serves raw records |
| `webapp/` | Landing page, live feed, Verify modal (Next.js) |
| `demo/` | Scripted price-tick scenario + CLI runner for the recorded demo |

Each has its own README with setup details.

## Running it locally

```bash
# 1. Deploy the contract
cd contracts && npm install && npm run deploy:monad

# 2. Register the risk policy (one time, after deploy)
cd ../backend && pip install -r requirements.txt
python -m scripts.register_policy

# 3. Start the backend
uvicorn app.main:app --reload --port 8000

# 4. Run the demo
cd ../demo && pip install -r ../agents/requirements.txt
python run_demo.py

# 5. Start the webapp
cd ../webapp && npm install && npm run dev
```

See `.env.example` at the repo root (and `webapp/.env.example`) for the
environment variables each piece needs. No real keys ship in this repo.
