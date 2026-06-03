import { BAZA_TOKEN_ABI, BAZA_TOKEN_ADDRESS } from "@/config/contracts";
import { baselineTotals, TX_STATS_BASELINE } from "@/data/txStatsBaseline";
import { createBasePublicClient } from "@/config/rpc";
import { encodeEventTopics, type Hash } from "viem";

/** First Base mainnet block with BazaToken on-chain activity. */
export const BAZA_TOKEN_DEPLOY_BLOCK = BigInt(46_494_397);

const LOG_CHUNK_SIZE = BigInt(9999);
const CHUNK_CONCURRENCY = 3;
/** Cap incremental scan per request (Vercel Hobby ≈10s limit). */
const MAX_INCREMENTAL_CHUNKS = 12;

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
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await publicClient.getLogs({
        address: BAZA_TOKEN_ADDRESS,
        fromBlock,
        toBlock,
      });
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
    }
  }
  throw lastError;
}

async function countEventsInRange(
  fromBlock: bigint,
  toBlock: bigint,
  maxChunks = MAX_INCREMENTAL_CHUNKS,
) {
  const allRanges = buildBlockRanges(fromBlock, toBlock);
  const ranges =
    maxChunks === Infinity ? allRanges : allRanges.slice(0, maxChunks);
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
  stale?: boolean;
};

export function getBaselineTransactionStats(): TransactionStats {
  return baselineTotals();
}

export async function fetchTotalTransactionStats(): Promise<TransactionStats> {
  const baselineBlock = BigInt(TX_STATS_BASELINE.lastBlock);
  const baseline = baselineTotals();

  let latestBlock: bigint;
  try {
    latestBlock = await publicClient.getBlockNumber();
  } catch {
    return { ...baseline, stale: true };
  }

  const scanFrom = baselineBlock + BigInt(1);
  if (scanFrom > latestBlock) {
    return {
      ...baseline,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const delta = await countEventsInRange(scanFrom, latestBlock);
    return {
      checkIns: baseline.checkIns + delta.checkIns,
      claims: baseline.claims + delta.claims,
      total:
        baseline.checkIns +
        baseline.claims +
        delta.checkIns +
        delta.claims,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return { ...baseline, stale: true };
  }
}

/** Full rescan from deploy block — used by sync script only. */
export async function fetchFullTransactionStats(): Promise<
  TransactionStats & { lastBlock: bigint }
> {
  const deployBlock = getDeployBlock();
  const latestBlock = await publicClient.getBlockNumber();
  const { checkIns, claims } = await countEventsInRange(
    deployBlock,
    latestBlock,
    Infinity,
  );

  return {
    checkIns,
    claims,
    total: checkIns + claims,
    updatedAt: new Date().toISOString(),
    lastBlock: latestBlock,
  };
}
