"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import type { State } from "wagmi";
import { WagmiProvider } from "wagmi";

import { getConfig } from "@/config/wagmi";

type ProvidersProps = {
  children: ReactNode;
  initialState?: State | undefined;
};

export function Providers({ children, initialState }: ProvidersProps) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
