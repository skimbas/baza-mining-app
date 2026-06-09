"use client";

import { useMemo } from "react";
import { useCapabilities, useConnection } from "wagmi";

import { BAZA_CHAIN_ID } from "@/config/contracts";
import { FARCASTER_CONNECTOR_ID } from "@/lib/walletConnectors";

/**
 * EIP-5792 / `wallet_getCapabilities` — batching (atomic) and paymaster hints.
 */
export function useWalletCapabilities() {
  const { address, status, connector } = useConnection();

  const {
    data,
    error,
    isPending,
    isFetching,
    refetch,
    isSuccess,
  } = useCapabilities({
    chainId: BAZA_CHAIN_ID,
    account: address,
    query: {
      enabled: Boolean(address) && status === "connected",
    },
  });

  const { supportsAtomicBatch, supportsPaymasterService } = useMemo(() => {
    if (connector?.id === FARCASTER_CONNECTOR_ID) {
      return { supportsAtomicBatch: false, supportsPaymasterService: false };
    }

    const atomic = data?.atomic;
    const supportsAtomicBatch =
      atomic?.status === "supported" || atomic?.status === "ready";
    const supportsPaymasterService = data?.paymasterService?.supported === true;
    return { supportsAtomicBatch, supportsPaymasterService };
  }, [connector?.id, data]);

  return {
    capabilities: data,
    supportsAtomicBatch,
    supportsPaymasterService,
    error,
    isPending,
    isFetching,
    isSuccess,
    refetch,
  };
}
