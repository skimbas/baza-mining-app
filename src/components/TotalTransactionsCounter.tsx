"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

type TransactionStatsResponse = {
  total: number;
  checkIns: number;
  claims: number;
  updatedAt: string;
};

const STORAGE_KEY = "baza-tx-stats-cache";

function readCachedStats(): TransactionStatsResponse | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as TransactionStatsResponse;
  } catch {
    return undefined;
  }
}

function writeCachedStats(stats: TransactionStatsResponse) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

async function fetchTransactionStats(): Promise<TransactionStatsResponse> {
  const response = await fetch("/api/stats/transactions");
  if (!response.ok) {
    throw new Error("Failed to load transaction stats");
  }
  const stats = (await response.json()) as TransactionStatsResponse;
  writeCachedStats(stats);
  return stats;
}

type TotalTransactionsCounterProps = {
  className?: string;
};

export function TotalTransactionsCounter({
  className = "",
}: TotalTransactionsCounterProps) {
  const cachedStats = useSyncExternalStore(
    () => () => undefined,
    readCachedStats,
    () => undefined,
  );

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["total-transactions"],
    queryFn: fetchTransactionStats,
    placeholderData: cachedStats,
    refetchInterval: 120_000,
    staleTime: 90_000,
    retry: 2,
    retryDelay: 3_000,
  });

  const display = data ?? cachedStats;
  const label =
    display != null
      ? display.total.toLocaleString("en-US")
      : isError
        ? "—"
        : isLoading
          ? "…"
          : "—";

  return (
    <div
      className={`rounded-xl border border-slate-700/80 bg-slate-950/40 px-4 py-2.5 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        Total on-chain txs
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-blue-200">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">
        All BAZA players{isFetching && display ? " · updating" : ""}
      </p>
    </div>
  );
}

export const TOTAL_TRANSACTIONS_QUERY_KEY = ["total-transactions"] as const;
