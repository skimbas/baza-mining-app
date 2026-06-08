import sdk from "@farcaster/frame-sdk";
import type { EIP1193Provider } from "viem";
import { injected } from "wagmi/connectors";

/** Farcaster mini app wallet via the host Ethereum provider (Warpcast). */
export function farcasterMiniApp() {
  return injected({
    target: {
      id: "farcaster",
      name: "Farcaster",
      provider: sdk.wallet.ethProvider as EIP1193Provider,
    },
    shimDisconnect: false,
  });
}
