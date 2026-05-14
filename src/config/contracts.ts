import { base } from "wagmi/chains";

export { BAZA_TOKEN_ABI } from "./abi";

/** Base Mainnet — chain id 8453 (typed as `typeof base` for wagmi chain literals). */
export const BAZA_CHAIN = base;

export const BAZA_CHAIN_ID = BAZA_CHAIN.id;

/** BazaToken (`BazaToken.sol` / Remix deploy) on Base Mainnet — checksummed. */
export const BAZA_TOKEN_ADDRESS =
  "0x685cD8bBC7EDac563024D798f19D12fdb2A89887" as const;
