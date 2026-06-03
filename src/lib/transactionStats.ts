import { BAZA_TOKEN_ABI, BAZA_TOKEN_ADDRESS } from "@/config/contracts";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

/** First Base mainnet block with BazaToken activity (scan from contract deploy). */
export const BAZA_TOKEN_DEPLOY_BLOCK = BigInt(46_102_501);

const LOG_CHUNK_SIZE = BigInt(9999);

const publicClient = createPublicClient({
  chain: base,
  transport: http(
    process.env.BASE_RPC_URL ??
      process.env.NEXT_PUBLIC_BASE_RPC_URL ??
      "https://mainnet.base.org",
  ),
});

async function countEventsInRange(
  eventName: "CheckedIn" | "TokensClaimed",
  fromBlock: bigint,
  toBlock: bigint,
) {
  let count = 0;
  let from = fromBlock;

  while (from <= toBlock) {
    const to = from + LOG_CHUNK_SIZE > toBlock ? toBlock : from + LOG_CHUNK_SIZE;
    const logs = await publicClient.getContractEvents({
      address: BAZA_TOKEN_ADDRESS,
      abi: BAZA_TOKEN_ABI,
      eventName,
      fromBlock: from,
      toBlock: to,
    });
    count += logs.length;
    from = to + BigInt(1);
  }

  return count;
}

export type TransactionStats = {
  total: number;
  checkIns: number;
  claims: number;
  updatedAt: string;
};

export async function fetchTotalTransactionStats(): Promise<TransactionStats> {
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock =
    process.env.BAZA_TOKEN_DEPLOY_BLOCK != null
      ? BigInt(process.env.BAZA_TOKEN_DEPLOY_BLOCK)
      : BAZA_TOKEN_DEPLOY_BLOCK;

  const [checkIns, claims] = await Promise.all([
    countEventsInRange("CheckedIn", fromBlock, latestBlock),
    countEventsInRange("TokensClaimed", fromBlock, latestBlock),
  ]);

  return {
    total: checkIns + claims,
    checkIns,
    claims,
    updatedAt: new Date().toISOString(),
  };
}
