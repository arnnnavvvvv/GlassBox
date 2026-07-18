import { createPublicClient, http } from "viem";
import { CONTRACT_ADDRESS, GLASSBOX_ABI, RPC_URL } from "./contract";

export interface OnchainDecision {
  decisionHash: `0x${string}`;
  agentId: string;
  verdict: number;
  timestamp: bigint;
  committer: string;
}

/** Reads a committed decision directly from Monad via RPC -- not through the
 * backend -- so a visitor can confirm the onchain hash independently of our
 * own database's opinion of what's onchain. */
export async function readOnchainDecision(onchainId: number): Promise<OnchainDecision> {
  if (!CONTRACT_ADDRESS || !RPC_URL) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_RPC_URL must be set to read onchain data.");
  }

  const client = createPublicClient({ transport: http(RPC_URL) });
  const [decisionHash, agentId, verdict, timestamp, committer] = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: GLASSBOX_ABI,
    functionName: "decisions",
    args: [BigInt(onchainId)],
  });

  return { decisionHash, agentId, verdict, timestamp, committer };
}
