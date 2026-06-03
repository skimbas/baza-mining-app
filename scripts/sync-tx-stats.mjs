/**
 * Full rescan → updates src/data/txStatsBaseline.ts
 * Run locally: npm run sync:tx-stats
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchFullTransactionStats } from "../src/lib/transactionStats.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baselinePath = join(__dirname, "../src/data/txStatsBaseline.ts");

const t0 = Date.now();
console.log("Scanning BazaToken events on Base mainnet…");

const stats = await fetchFullTransactionStats();

const content = `/**
 * Last full on-chain scan — update via \`npm run sync:tx-stats\`.
 * API adds new events from lastBlock+1 to latest on each request.
 */
export const TX_STATS_BASELINE = {
  checkIns: ${stats.checkIns},
  claims: ${stats.claims},
  /** Base mainnet block through which checkIns/claims were counted. */
  lastBlock: ${stats.lastBlock},
  updatedAt: "${stats.updatedAt}",
} as const;

export function baselineTotals() {
  return {
    total: TX_STATS_BASELINE.checkIns + TX_STATS_BASELINE.claims,
    checkIns: TX_STATS_BASELINE.checkIns,
    claims: TX_STATS_BASELINE.claims,
    updatedAt: TX_STATS_BASELINE.updatedAt,
  };
}
`;

writeFileSync(baselinePath, content, "utf8");

console.log({
  ...stats,
  total: stats.checkIns + stats.claims,
  lastBlock: stats.lastBlock.toString(),
  ms: Date.now() - t0,
});
console.log(`Updated ${baselinePath}`);
