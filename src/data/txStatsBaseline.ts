/**
 * Last full on-chain scan — update via `npm run sync:tx-stats`.
 * API adds new events from lastBlock+1 to latest on each request.
 */
export const TX_STATS_BASELINE = {
  checkIns: 90,
  claims: 207,
  /** Base mainnet block through which checkIns/claims were counted. */
  lastBlock: 46870178,
  updatedAt: "2026-06-03T23:35:17.520Z",
} as const;

export function baselineTotals() {
  return {
    total: TX_STATS_BASELINE.checkIns + TX_STATS_BASELINE.claims,
    checkIns: TX_STATS_BASELINE.checkIns,
    claims: TX_STATS_BASELINE.claims,
    updatedAt: TX_STATS_BASELINE.updatedAt,
  };
}
