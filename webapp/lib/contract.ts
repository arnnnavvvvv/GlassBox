// Minimal ABI subset the webapp actually calls -- just the public getter
// needed to read a committed decision directly from chain. Kept hand
// -written here (rather than importing /contracts) so the webapp has no
// filesystem dependency on the rest of the monorepo.
export const GLASSBOX_ABI = [
  {
    type: "function",
    name: "decisions",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "decisionHash", type: "bytes32" },
      { name: "agentId", type: "string" },
      { name: "verdict", type: "uint8" },
      { name: "timestamp", type: "uint256" },
      { name: "committer", type: "address" },
    ],
  },
] as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
export const EXPLORER_TX_URL =
  process.env.NEXT_PUBLIC_EXPLORER_TX_URL || "https://testnet.monadexplorer.com/tx";
