import { fetchTotalTransactionStats } from "@/lib/transactionStats";
import type { TransactionStats } from "@/lib/transactionStats";
import { getBaselineTransactionStats } from "@/lib/transactionStats";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const CACHE_SECONDS = 300;

const getCachedTransactionStats = unstable_cache(
  fetchTotalTransactionStats,
  ["baza-total-transactions-v2"],
  { revalidate: CACHE_SECONDS },
);

let memoryCache: { stats: TransactionStats; at: number } | null = null;

function jsonResponse(stats: TransactionStats, cacheSeconds: number) {
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=600`,
    },
  });
}

export async function GET() {
  const now = Date.now();
  const fallback = getBaselineTransactionStats();

  if (memoryCache && now - memoryCache.at < CACHE_SECONDS * 1000) {
    return jsonResponse(memoryCache.stats, CACHE_SECONDS);
  }

  try {
    const stats = await getCachedTransactionStats();
    memoryCache = { stats, at: now };
    return jsonResponse(stats, CACHE_SECONDS);
  } catch (error) {
    console.error("[stats/transactions]", error);

    if (memoryCache) {
      return jsonResponse(memoryCache.stats, 60);
    }

    // Always return a number — baseline is better than "…" forever.
    return jsonResponse({ ...fallback, stale: true }, 60);
  }
}
