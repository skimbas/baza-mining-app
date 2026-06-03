"use client";

import { useQuery } from "@tanstack/react-query";

type TransactionStatsResponse = {
  total: number;
  checkIns: number;
  claims: number;
  updatedAt: string;
};

async function fetchTransactionStats(): Promise<TransactionStatsResponse> {
  const response = await fetch("/api/stats/transactions");
  if (!response.ok) {
    throw new Error("Failed to load transaction stats");
  }
  return response.json() as Promise<TransactionStatsResponse>;
}

type TotalTransactionsCounterProps = {
  className?: string;
};

export function TotalTransactionsCounter({
  className = "",
}: TotalTransactionsCounterProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["total-transactions"],
    queryFn: fetchTransactionStats,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const label = isLoading
    ? "…"
    : isError || data == null
      ? "—"
      : data.total.toLocaleString("en-US");

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
      <p className="mt-0.5 text-[11px] text-slate-500">All BAZA players</p>
    </div>
  );
}

export const TOTAL_TRANSACTIONS_QUERY_KEY = ["total-transactions"] as const;
