from functools import lru_cache

from eth_account import Account
from web3 import Web3

from . import config


def _to_prefixed_hex(value) -> str:
    """HexBytes.hex() drops the 0x prefix on some web3.py versions -- always
    normalize to a 0x-prefixed string so tx hashes are consistent everywhere
    (explorer links, decisionHash comparisons, the webapp)."""
    hex_str = bytes(value).hex()
    return hex_str if hex_str.startswith("0x") else f"0x{hex_str}"


class ChainNotConfiguredError(RuntimeError):
    """Raised when the backend wallet key or deployment is missing. Never
    silently skip a commit -- the caller must surface this as a failure."""


@lru_cache
def get_web3() -> Web3:
    return Web3(Web3.HTTPProvider(config.MONAD_RPC_URL))


@lru_cache
def get_contract():
    deployment = config.load_deployment()
    w3 = get_web3()
    return w3.eth.contract(address=Web3.to_checksum_address(deployment["address"]), abi=deployment["abi"])


@lru_cache
def get_account() -> Account:
    if not config.BACKEND_WALLET_PRIVATE_KEY:
        raise ChainNotConfiguredError(
            "BACKEND_WALLET_PRIVATE_KEY is not set -- cannot sign a commit transaction."
        )
    return Account.from_key(config.BACKEND_WALLET_PRIVATE_KEY)


def _send(fn_call):
    """Builds, estimates gas for, signs, sends, and confirms a contract call.
    Raises on any failure -- there is no fire-and-forget path here, per
    AGENT.md's rule that a failed commit must block execution."""
    w3 = get_web3()
    account = get_account()

    base_tx = {
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gasPrice": w3.eth.gas_price,
        "chainId": config.MONAD_CHAIN_ID,
    }
    estimated_gas = fn_call.estimate_gas(base_tx)
    tx = fn_call.build_transaction({**base_tx, "gas": int(estimated_gas * 1.2)})

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    if receipt.status != 1:
        raise RuntimeError(f"transaction reverted: {_to_prefixed_hex(tx_hash)}")

    return receipt


def commit_decision(decision_hash: str, agent_id: str, verdict: int) -> dict:
    """Submits commitDecision() to Monad, waits for the receipt, and returns
    the tx hash + the sequential onchain id assigned to this decision."""
    contract = get_contract()
    receipt = _send(contract.functions.commitDecision(decision_hash, agent_id, verdict))

    events = contract.events.DecisionCommitted().process_receipt(receipt)
    if not events:
        raise RuntimeError(
            f"commitDecision succeeded but emitted no DecisionCommitted event: "
            f"{_to_prefixed_hex(receipt.transactionHash)}"
        )

    onchain_id = events[0]["args"]["id"]
    return {"txHash": _to_prefixed_hex(receipt.transactionHash), "onchainId": onchain_id}


def register_policy(policy_hash: str) -> dict:
    contract = get_contract()
    receipt = _send(contract.functions.registerPolicy(policy_hash))
    return {"txHash": _to_prefixed_hex(receipt.transactionHash)}
