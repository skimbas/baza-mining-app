import { BAZA_BUILDER_DATA_SUFFIX } from "@/config/builderCode";
import type { AppHost } from "@/lib/miniAppHost";
import { FARCASTER_CONNECTOR_ID } from "@/lib/walletConnectors";
import type { Hex } from "viem";

/** Farcaster host wallet rejects ERC-8021 builder suffixes on contract writes. */
export function shouldAttachBuilderCode(
  appHost: AppHost | null,
  connectorId?: string,
) {
  if (appHost === "farcaster" || connectorId === FARCASTER_CONNECTOR_ID) {
    return false;
  }
  return true;
}

export function builderWriteExtras(
  appHost: AppHost | null,
  connectorId?: string,
): { dataSuffix?: Hex } {
  if (!shouldAttachBuilderCode(appHost, connectorId)) return {};
  return { dataSuffix: BAZA_BUILDER_DATA_SUFFIX };
}
