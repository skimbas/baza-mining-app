import { fetchTotalTransactionStats } from "@/lib/transactionStats";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

const getCachedTransactionStats = unstable_cache(
  fetchTotalTransactionStats,
  ["baza-total-transactions"],
  { revalidate: 300 },
);

export async function GET() {
  try {
    const stats = await getCachedTransactionStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[stats/transactions]", error);
    return NextResponse.json(
      { error: "Failed to load transaction stats" },
      { status: 503 },
    );
  }
}
