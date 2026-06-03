import { fetchTotalTransactionStats } from "@/lib/transactionStats";
import type { TransactionStats } from "@/lib/transactionStats";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const CACHE_SECONDS = 600;

const getCachedTransactionStats = unstable_cache(
  fetchTotalTransactionStats,
  ["baza-total-transactions"],
  { revalidate: CACHE_SECONDS },
);

let memoryCache: { stats: TransactionStats; at: number } | null = null;

export async function GET() {
  const now = Date.now();

  if (memoryCache && now - memoryCache.at < CACHE_SECONDS * 1000) {
    return NextResponse.json(memoryCache.stats, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=1200`,
      },
    });
  }

  try {
    const stats = await getCachedTransactionStats();
    memoryCache = { stats, at: now };
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=1200`,
      },
    });
  } catch (error) {
    console.error("[stats/transactions]", error);

    if (memoryCache) {
      return NextResponse.json(memoryCache.stats, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to load transaction stats" },
      { status: 503 },
    );
  }
}
