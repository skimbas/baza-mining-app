"use client";

import sdk from "@farcaster/frame-sdk";
import { useEffect, useRef, useState } from "react";
import { useConfig, useConnect, useConnection, useDisconnect } from "wagmi";
import { reconnect } from "wagmi/actions";

const FARCASTER_CONNECTOR_ID = "farcaster";

type BootstrapPhase =
  | "idle"
  | "detecting"
  | "disconnect-wrong"
  | "reconnect"
  | "done";

/**
 * Bootstraps the Farcaster mini app wallet once per session.
 * Avoids reconnect loops with Base Account cookies from SSR.
 */
export function useFarcasterAutoConnect() {
  const config = useConfig();
  const { connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { connector, isConnected, status } = useConnection();
  const [inMiniApp, setInMiniApp] = useState<boolean | null>(null);
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
          await sdk.actions.ready();
          const mini = await sdk.isInMiniApp();
          if (cancelled) return;
          setInMiniApp(mini);
          if (!mini) {
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

  const isBootstrapping = inMiniApp === null || (inMiniApp && !walletReady);

  return { inMiniApp, isBootstrapping, walletReady };
}
