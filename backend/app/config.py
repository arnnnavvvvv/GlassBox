import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

MONAD_RPC_URL = os.environ.get("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")
MONAD_CHAIN_ID = int(os.environ.get("MONAD_CHAIN_ID", "10143"))
BACKEND_WALLET_PRIVATE_KEY = os.environ.get("BACKEND_WALLET_PRIVATE_KEY")
MONAD_EXPLORER_TX_URL = os.environ.get("MONAD_EXPLORER_TX_URL", "https://testnet.monadexplorer.com/tx")

DEPLOYMENT_NETWORK = os.environ.get("GLASSBOX_DEPLOYMENT_NETWORK", "monadTestnet")
DEPLOYMENT_FILE = REPO_ROOT / "contracts" / "deployments" / f"{DEPLOYMENT_NETWORK}.json"

DB_PATH = os.environ.get("GLASSBOX_DB_PATH", str(REPO_ROOT / "backend" / "glassbox.db"))

# When set (e.g. a Neon connection string), decisions are stored in Postgres
# instead of the local SQLite file -- so data survives restarts on hosts with
# ephemeral disk (Render's free tier, notably). Local dev without this var
# set keeps using SQLite unchanged.
DATABASE_URL = os.environ.get("DATABASE_URL")


def load_deployment() -> dict:
    """Reads the deployed contract address + ABI written by contracts/scripts/deploy.js.

    Raises FileNotFoundError with a clear message if the contract hasn't been
    deployed yet -- there is no placeholder fallback, per AGENT.md's rule
    against faking onchain state.
    """
    if not DEPLOYMENT_FILE.exists():
        raise FileNotFoundError(
            f"No deployment found at {DEPLOYMENT_FILE}. Run "
            f"`npm run deploy:monad` in /contracts first."
        )
    with open(DEPLOYMENT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
