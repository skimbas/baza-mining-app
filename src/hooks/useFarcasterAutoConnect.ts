"use client";

import { useEffect, useRef, useState } from "react";
import { useConfig, useConnect, useConnection, useDisconnect } from "wagmi";
import { reconnect } from "wagmi/actions";

import {
  detectAppHost,
  isBaseAppHost,
  isFarcasterHost,
  resolveAppHost,
  type AppHost,
} from "@/lib/miniAppHost";
import { getHostConnector } from "@/lib/walletConnectors";

type BootstrapPhase =
  | "idle"
  | "detecting"
  | "disconnect-wrong"
  | "reconnect"
  | "done";

/**
 * Detects mini app host and bootstraps the Farcaster wallet in Warpcast.
 * Base App uses wagmi cookie reconnect + manual connect (injected host wallet).
 */
export function useFarcasterAutoConnect() {
  const config = useConfig();
  const { connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { connector, isConnected, status } = useConnection();
  const [appHost, setAppHost] = useState<AppHost | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const phaseRef = useRef<BootstrapPhase>("idle");
  const hostRef = useRef<AppHost | null>(null);

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
          const detectedHost = await detectAppHost();
          const host = resolveAppHost(detectedHost) ?? detectedHost;
          if (cancelled) return;
          hostRef.current = host;
          setAppHost(host);

          if (!isFarcasterHost(host)) {
            finish();
            return;
          }
        }

        if (status === "connecting" || status === "reconnecting") {
          return;
        }

        const host = hostRef.current;
        if (!host || !isFarcasterHost(host)) {
          finish();
          return;
        }

        const hostConnector = getHostConnector(connectors, host);
        if (!hostConnector) {
          finish();
          return;
        }

        if (isConnected && connector?.uid === hostConnector.uid) {
          finish();
          return;
        }

        if (isConnected && connector?.uid !== hostConnector.uid) {
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
        await reconnect(config, { connectors: [hostConnector] });
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
    connector?.uid,
    connectors,
    disconnectAsync,
    isConnected,
    status,
  ]);

  const effectiveAppHost = resolveAppHost(appHost);
  const isFarcasterMiniApp = effectiveAppHost === "farcaster";
  const isBaseApp = isBaseAppHost(effectiveAppHost ?? "browser");
  const isBootstrapping = isFarcasterMiniApp && !walletReady;

  return {
    appHost,
    inMiniApp: isFarcasterMiniApp,
    isBaseApp,
    isBootstrapping,
    walletReady,
  };
}
