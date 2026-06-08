"use client";

import sdk from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useConnect, useConnection, useDisconnect } from "wagmi";

import { BAZA_CHAIN } from "@/config/contracts";

const FARCASTER_CONNECTOR_ID = "farcaster";

/**
 * In Warpcast, connect via the Farcaster mini app wallet instead of Base Account.
 * Waits for `sdk.actions.ready()` so the host wallet is available before txs.
 */
export function useFarcasterAutoConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { connector, isConnected, isReconnecting } = useConnection();
  const [inMiniApp, setInMiniApp] = useState<boolean | null>(null);
  const [walletReady, setWalletReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await sdk.actions.ready();
        const mini = await sdk.isInMiniApp();
        if (cancelled) return;

        setInMiniApp(mini);
        if (!mini) {
          setWalletReady(true);
          return;
        }

        if (isReconnecting) return;

        const farcasterConnector = connectors.find(
          (item) => item.id === FARCASTER_CONNECTOR_ID,
        );
        if (!farcasterConnector) {
          setWalletReady(true);
          return;
        }

        if (isConnected && connector?.id !== FARCASTER_CONNECTOR_ID) {
          disconnect();
          return;
        }

        if (!isConnected) {
          await connect({
            connector: farcasterConnector,
            chainId: BAZA_CHAIN.id,
          });
        }
      } catch {
        // User can still connect manually from the connect screen.
      } finally {
        if (!cancelled) setWalletReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    connect,
    connector?.id,
    connectors,
    disconnect,
    isConnected,
    isReconnecting,
  ]);

  const isBootstrapping =
    inMiniApp === true && (!walletReady || isReconnecting);

  return { inMiniApp, isBootstrapping, walletReady };
}
