import type { AppHost } from "@/lib/miniAppHost";
import type { Connector } from "wagmi";

export const FARCASTER_CONNECTOR_ID = "farcaster";
export const BASE_ACCOUNT_CONNECTOR_ID = "baseAccount";
const INJECTED_CONNECTOR_ID = "injected";

/** Injected EIP-6963 wallets that duplicate the Base Account SDK connector on desktop. */
export function isBaseAppInjectedProvider(connector: Connector) {
  const id = connector.id.toLowerCase();
  if (id.includes("coinbase")) return true;

  const name = connector.name.toLowerCase();
  return (
    name.includes("coinbase") ||
    name.includes("base account") ||
    name === "base"
  );
}

export function isDuplicateOfBaseAccount(connector: Connector) {
  if (connector.id === BASE_ACCOUNT_CONNECTOR_ID) return false;
  return isBaseAppInjectedProvider(connector);
}

/**
 * In the Base App in-app browser the wallet is the injected host provider,
 * not the Base Account SDK popup connector.
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */
export function getBaseAppConnector(
  connectors: readonly Connector[],
): Connector | undefined {
  const candidates = connectors.filter(
    (item) =>
      item.id !== FARCASTER_CONNECTOR_ID &&
      item.id !== BASE_ACCOUNT_CONNECTOR_ID,
  );

  const namedBaseProvider = candidates.find(isBaseAppInjectedProvider);
  if (namedBaseProvider) return namedBaseProvider;

  return (
    candidates.find((item) => item.id === INJECTED_CONNECTOR_ID) ??
    candidates[0]
  );
}

export function getHostConnector(
  connectors: readonly Connector[],
  appHost: AppHost,
): Connector | undefined {
  if (appHost === "farcaster") {
    return connectors.find((item) => item.id === FARCASTER_CONNECTOR_ID);
  }
  if (appHost === "base-app") {
    return getBaseAppConnector(connectors);
  }
  return undefined;
}

export function connectorLabel(
  connectorId: string,
  name: string,
  appHost: AppHost | null = null,
) {
  if (appHost === "base-app") return "Base Account";
  if (connectorId === FARCASTER_CONNECTOR_ID) return "Farcaster Wallet";
  if (connectorId === BASE_ACCOUNT_CONNECTOR_ID) return "Base Account";
  if (name.toLowerCase() === "injected") return "Browser wallet";
  return name;
}

export function filterVisibleConnectors(
  connectors: readonly Connector[],
  appHost: AppHost | null,
) {
  const filtered =
    appHost === "farcaster"
      ? connectors.filter((item) => item.id === FARCASTER_CONNECTOR_ID)
      : appHost === "base-app"
        ? (() => {
            const connector = getBaseAppConnector(connectors);
            return connector ? [connector] : [];
          })()
        : connectors
            .filter((item) => item.id !== FARCASTER_CONNECTOR_ID)
            .filter(
              (item) =>
                item.id === BASE_ACCOUNT_CONNECTOR_ID ||
                !isDuplicateOfBaseAccount(item),
            );

  const seen = new Set<string>();
  return filtered.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
