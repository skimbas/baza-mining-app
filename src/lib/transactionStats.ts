import { BAZA_TOKEN_ABI, BAZA_TOKEN_ADDRESS } from "@/config/contracts";
import { createBasePublicClient } from "@/config/rpc";
import { encodeEventTopics, type Hash } from "viem";

/** First Base mainnet block with BazaToken on-chain activity. */
export const BAZA_TOKEN_DEPLOY_BLOCK = BigInt(46_494_397);

const LOG_CHUNK_SIZE = BigInt(9999);
/** Keep low — public Base RPC rate-limits concurrent eth_getLogs. */
const CHUNK_CONCURRENCY = 3;

const CHECKED_IN_TOPIC = encodeEventTopics({
  abi: BAZA_TOKEN_ABI,
  eventName: "CheckedIn",
})[0];

const TOKENS_CLAIMED_TOPIC = encodeEventTopics({
  abi: BAZA_TOKEN_ABI,
  eventName: "TokensClaimed",
})[0];

const publicClient = createBasePublicClient();

type BlockRange = { fromBlock: bigint; toBlock: bigint };

function getDeployBlock() {
  return process.env.BAZA_TOKEN_DEPLOY_BLOCK != null
    ? BigInt(process.env.BAZA_TOKEN_DEPLOY_BLOCK)
    : BAZA_TOKEN_DEPLOY_BLOCK;
}

function buildBlockRanges(fromBlock: bigint, toBlock: bigint): BlockRange[] {
  const ranges: BlockRange[] = [];
  let from = fromBlock;

  while (from <= toBlock) {
    const to =
      from + LOG_CHUNK_SIZE > toBlock ? toBlock : from + LOG_CHUNK_SIZE;
    ranges.push({ fromBlock: from, toBlock: to });
    from = to + BigInt(1);
  }

  return ranges;
}

function classifyLog(topic: Hash | undefined) {
  if (topic === CHECKED_IN_TOPIC) return "checkIn" as const;
  if (topic === TOKENS_CLAIMED_TOPIC) return "claim" as const;
  return null;
}

async function getLogsWithRetry(fromBlock: bigint, toBlock: bigint) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await publicClient.getLogs({
        address: BAZA_TOKEN_ADDRESS,
        fromBlock,
        toBlock,
      });
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw lastError;
}

async function countEventsInRange(fromBlock: bigint, toBlock: bigint) {
  const ranges = buildBlockRanges(fromBlock, toBlock);
  let checkIns = 0;
  let claims = 0;

  for (let i = 0; i < ranges.length; i += CHUNK_CONCURRENCY) {
    const batch = ranges.slice(i, i + CHUNK_CONCURRENCY);
    const logGroups = await Promise.all(
      batch.map(({ fromBlock: from, toBlock: to }) =>
        getLogsWithRetry(from, to),
      ),
    );

    for (const logs of logGroups) {
      for (const log of logs) {
        const kind = classifyLog(log.topics[0]);
        if (kind === "checkIn") checkIns += 1;
        else if (kind === "claim") claims += 1;
      }
    }
  }

  return { checkIns, claims };
}

export type TransactionStats = {
  total: number;
  checkIns: number;
  claims: number;
  updatedAt: string;
};

export async function fetchTotalTransactionStats(): Promise<TransactionStats> {
  const deployBlock = getDeployBlock();
  const latestBlock = await publicClient.getBlockNumber();
  const { checkIns, claims } = await countEventsInRange(
    deployBlock,
    latestBlock,
  );

  return {
    total: checkIns + claims,
    checkIns,
    claims,
    updatedAt: new Date().toISOString(),
  };
}
