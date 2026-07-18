from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from glassbox_gate.canonical import hash_payload

from . import chain, config, db
from .schemas import CommitResponse, DecisionDetail, DecisionPayload, DecisionSummary


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="GlassBox Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _explorer_url(tx_hash: str) -> str:
    return f"{config.MONAD_EXPLORER_TX_URL}/{tx_hash}"


def _row_to_summary(row: dict) -> dict:
    return {
        "id": row["id"],
        "onchainId": row["onchainId"],
        "agentId": row["agentId"],
        "action": row["action"],
        "verdict": row["verdict"],
        "price": row["price"],
        "decisionHash": row["decisionHash"],
        "txHash": row["txHash"],
        "explorerUrl": _explorer_url(row["txHash"]),
        "createdAt": row["createdAt"],
    }


@app.post("/api/decisions", response_model=CommitResponse)
def create_decision(payload: DecisionPayload):
    canonical = payload.model_dump()
    decision_hash = hash_payload(canonical)

    agent_id = canonical["decision"].get("agentId")
    action = canonical["decision"].get("action")
    verdict_raw = canonical["riskVerdict"].get("verdict")

    if agent_id is None or action is None or verdict_raw is None:
        raise HTTPException(
            status_code=422,
            detail="decision.agentId, decision.action, and riskVerdict.verdict are required",
        )

    # riskVerdict.verdict goes through the same fixed-precision number
    # canonicalization as every other number (e.g. "1.00000000") so the hash
    # stays generic and deterministic -- convert back to a real int here for
    # the uint8 contract argument.
    verdict = int(float(verdict_raw))

    try:
        result = chain.commit_decision(decision_hash, agent_id, verdict)
    except chain.ChainNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        # The gate treats any non-2xx response as a failed commit and blocks
        # execution -- we must not return 200 unless the commit truly succeeded.
        raise HTTPException(status_code=502, detail=f"onchain commit failed: {exc}") from exc

    created_at = datetime.now(timezone.utc).isoformat()
    row_id = db.insert_decision(
        onchain_id=result["onchainId"],
        agent_id=agent_id,
        action=action,
        verdict=int(verdict),
        decision_hash=decision_hash,
        tx_hash=result["txHash"],
        payload=canonical,
        created_at=created_at,
    )

    return CommitResponse(
        id=row_id,
        onchainId=result["onchainId"],
        decisionHash=decision_hash,
        txHash=result["txHash"],
        explorerUrl=_explorer_url(result["txHash"]),
    )


@app.get("/api/decisions", response_model=list[DecisionSummary])
def list_decisions():
    return [_row_to_summary(row) for row in db.list_decisions()]


@app.get("/api/decisions/{decision_id}", response_model=DecisionDetail)
def get_decision(decision_id: int):
    row = db.get_decision(decision_id)
    if row is None:
        raise HTTPException(status_code=404, detail="decision not found")
    return {**_row_to_summary(row), "payload": row["payload"]}


@app.get("/api/health")
def health():
    return {"status": "ok"}
