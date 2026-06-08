"use client";

import { useEffect, useRef, useState } from "react";
import { useConfig, useConnect, useConnection, useDisconnect } from "wagmi";
import { reconnect } from "wagmi/actions";

import {
  detectAppHost,
  isFarcasterHost,
  type AppHost,
} from "@/lib/miniAppHost";

const FARCASTER_CONNECTOR_ID = "farcaster";
const BASE_ACCOUNT_CONNECTOR_ID = "baseAccount";

type BootstrapPhase =
  | "idle"
  | "detecting"
  | "disconnect-wrong"
  | "reconnect"
  | "done";

/**
 * Detects mini app host and bootstraps the wallet connector for that host.
 * Farcaster Warpcast → Farcaster provider. Base App → baseAccount (wagmi reconnect).
 */
export function useFarcasterAutoConnect() {
  const config = useConfig();
  const { connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { connector, isConnected, status } = useConnection();
  const [appHost, setAppHost] = useState<AppHost | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const phaseRef = useRef<BootstrapPhase>("idle");

  useEffect(() => {
    if (phaseRef.current === "done") return;

    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      phaseRef.current = "done";
      setWalletReady(true);
    };

    void (async () => {
      try {
        if (phaseRef.current === "idle") {
          phaseRef.current = "detecting";
          const host = await detectAppHost();
          if (cancelled) return;
          setAppHost(host);

          if (!isFarcasterHost(host)) {
            if (host === "base-app") {
              if (status === "connecting" || status === "reconnecting") {
                return;
              }

              const baseConnector = connectors.find(
                (item) => item.id === BASE_ACCOUNT_CONNECTOR_ID,
              );
              if (baseConnector && !isConnected) {
                await reconnect(config, { connectors: [baseConnector] });
              }
            }
            finish();
            return;
          }
        }

        if (status === "connecting" || status === "reconnecting") {
          return;
        }

        const farcasterConnector = connectors.find(
          (item) => item.id === FARCASTER_CONNECTOR_ID,
        );
        if (!farcasterConnector) {
          finish();
          return;
        }

        if (isConnected && connector?.id === FARCASTER_CONNECTOR_ID) {
          finish();
          return;
        }

        if (isConnected && connector?.id !== FARCASTER_CONNECTOR_ID) {
          if (phaseRef.current !== "disconnect-wrong") {
            phaseRef.current = "disconnect-wrong";
            await disconnectAsync();
          }
          return;
        }

        if (phaseRef.current === "reconnect") {
          finish();
          return;
        }

        phaseRef.current = "reconnect";
        await reconnect(config, { connectors: [farcasterConnector] });
        finish();
      } catch {
        finish();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    config,
    connector?.id,
    connectors,
    disconnectAsync,
    isConnected,
    status,
  ]);

  const isFarcasterMiniApp = appHost === "farcaster";
  const isBootstrapping = isFarcasterMiniApp && !walletReady;

  return {
    appHost,
    inMiniApp: isFarcasterMiniApp,
    isBootstrapping,
    walletReady,
  };
}
