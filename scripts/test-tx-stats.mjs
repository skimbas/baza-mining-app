import { createPublicClient, encodeEventTopics, fallback, http } from "viem";
import { base } from "viem/chains";

const BAZA_TOKEN_ADDRESS = "0x685cD8bBC7EDac563024D798f19D12fdb2A89887";
const BAZA_TOKEN_ABI = [
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "streak", type: "uint256", indexed: false },
      { name: "mintedAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensClaimed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
];

const START = 46494397n;
const CHUNK = 9999n;
const CONCURRENCY = 3;

const client = createPublicClient({
  chain: base,
  transport: fallback([http("https://mainnet.base.org")]),
});

const CHECKED_IN = encodeEventTopics({
  abi: BAZA_TOKEN_ABI,
  eventName: "CheckedIn",
})[0];
const TOKENS_CLAIMED = encodeEventTopics({
  abi: BAZA_TOKEN_ABI,
  eventName: "TokensClaimed",
})[0];

async function countRange(fromBlock, toBlock) {
  const ranges = [];
  let from = fromBlock;
  while (from <= toBlock) {
    const to = from + CHUNK > toBlock ? toBlock : from + CHUNK;
    ranges.push({ from, to });
    from = to + 1n;
  }

  let checkIns = 0;
  let claims = 0;

  for (let i = 0; i < ranges.length; i += CONCURRENCY) {
    const batch = ranges.slice(i, i + CONCURRENCY);
    const groups = await Promise.all(
      batch.map(async ({ from, to }) => {
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            return await client.getLogs({
              address: BAZA_TOKEN_ADDRESS,
              fromBlock: from,
              toBlock: to,
            });
          } catch (error) {
            await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
            if (attempt === 3) throw error;
          }
        }
      }),
    );

    for (const logs of groups) {
      for (const log of logs) {
        if (log.topics[0] === CHECKED_IN) checkIns++;
        else if (log.topics[0] === TOKENS_CLAIMED) claims++;
      }
    }
  }

  return { checkIns, claims, chunks: ranges.length };
}

const t0 = Date.now();
const latest = await client.getBlockNumber();
const stats = await countRange(START, latest);
console.log({ ...stats, total: stats.checkIns + stats.claims, ms: Date.now() - t0 });
