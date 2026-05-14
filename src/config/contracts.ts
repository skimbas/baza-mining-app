import { base, type Chain } from "wagmi/chains";

/** Base Mainnet — chain id 8453 (use for production after Remix deploy). */
export const BAZA_CHAIN: Chain = base;

export const BAZA_CHAIN_ID = BAZA_CHAIN.id;

/**
 * Paste the BazaToken contract address from Remix (Base Mainnet) here only.
 * Replace the placeholder before using the app on mainnet.
 */
export const BAZA_TOKEN_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;
