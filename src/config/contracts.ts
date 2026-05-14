import { base, type Chain } from "wagmi/chains";

/** Base Mainnet — chain id 8453. */
export const BAZA_CHAIN: Chain = base;

export const BAZA_CHAIN_ID = BAZA_CHAIN.id;

/** BazaToken (`BazaToken.sol` / Remix deploy) on Base Mainnet — checksummed. */
export const BAZA_TOKEN_ADDRESS =
  "0x685cD8bBC7EDac563024D798f19D12fdb2A89887" as const;
