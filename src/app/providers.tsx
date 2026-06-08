"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import type { State } from "wagmi";
import { WagmiProvider } from "wagmi";

import { getConfig } from "@/config/wagmi";
import { detectAppHost, isFarcasterHost } from "@/lib/miniAppHost";
import sdk from "@farcaster/frame-sdk";

type ProvidersProps = {
  children: ReactNode;
  initialState?: State | undefined;
};

export function Providers({ children, initialState }: ProvidersProps) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    void (async () => {
      const host = await detectAppHost();
      if (isFarcasterHost(host)) {
        await sdk.actions.ready();
      }
    })();
  }, []);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
