import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** Base Builder Code from base.dev → Settings → Builder Codes */
export const BAZA_BUILDER_CODE =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "bc_5urownup";

/** ERC-8021 suffix appended to transaction calldata for attribution. */
export const BAZA_BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BAZA_BUILDER_CODE],
}) as Hex;

/** EIP-5792 capability for `wallet_sendCalls` (Base Smart Wallet). */
export const BAZA_BUILDER_SEND_CALLS_CAPABILITIES = {
  dataSuffix: {
    value: BAZA_BUILDER_DATA_SUFFIX,
    optional: true,
  },
} as const;
