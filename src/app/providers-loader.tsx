"use client";

import dynamic from "next/dynamic";

/** Avoids running wallet connectors (e.g. Base Account telemetry) during SSR/static prerender. */
export const Providers = dynamic(
  () => import("./providers").then((m) => m.Providers),
  { ssr: false },
);
