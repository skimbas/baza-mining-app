import type { Connector } from "wagmi";

export const FARCASTER_CONNECTOR_ID = "farcaster";
export const BASE_ACCOUNT_CONNECTOR_ID = "baseAccount";

/** Injected EIP-6963 wallets that duplicate the Base Account connector. */
export function isDuplicateOfBaseAccount(connector: Connector) {
  if (connector.id === BASE_ACCOUNT_CONNECTOR_ID) return false;

  const id = connector.id.toLowerCase();
  if (id.includes("coinbase")) return true;

  const name = connector.name.toLowerCase();
  return (
    name.includes("coinbase wallet") ||
    name.includes("base account") ||
    name === "base"
  );
}

export function connectorLabel(connectorId: string, name: string) {
  if (connectorId === FARCASTER_CONNECTOR_ID) return "Farcaster Wallet";
  if (connectorId === BASE_ACCOUNT_CONNECTOR_ID) return "Base Account";
  return name;
}

export function filterVisibleConnectors(
  connectors: readonly Connector[],
  appHost: "browser" | "farcaster" | "base-app" | null,
) {
  const filtered =
    appHost === "farcaster"
      ? connectors.filter((item) => item.id === FARCASTER_CONNECTOR_ID)
      : appHost === "base-app"
        ? connectors.filter((item) => item.id === BASE_ACCOUNT_CONNECTOR_ID)
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
