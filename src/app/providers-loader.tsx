"use client";

import dynamic from "next/dynamic";
import type { State } from "wagmi";

import { MiniAppReady } from "@/components/MiniAppReady";

const DynamicProviders = dynamic(
  () => import("./providers").then((m) => m.Providers),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <p className="text-sm text-slate-400">Loading BAZA…</p>
      </div>
    ),
  },
);

export function ProvidersShell({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State | undefined;
}) {
  return (
    <>
      <MiniAppReady />
      <DynamicProviders initialState={initialState}>
        {children}
      </DynamicProviders>
    </>
  );
}
