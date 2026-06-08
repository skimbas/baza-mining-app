"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { waitForCallsStatus, waitForTransactionReceipt } from "wagmi/actions";
import {
  useConfig,
  useConnection,
  useSendCalls,
  useWriteContract,
} from "wagmi";

import {
  BAZA_BUILDER_DATA_SUFFIX,
  BAZA_BUILDER_SEND_CALLS_CAPABILITIES,
} from "@/config/builderCode";
import {
  BAZA_TOKEN_ABI,
  BAZA_TOKEN_ADDRESS,
} from "@/config/contracts";
import type { UiTheme } from "@/config/uiThemes";

type ClaimTokensButtonProps = {
  /** Whole $BAZA units to mint (matches `claimTokens(uint256 amount)`). */
  amount: bigint;
  disabled: boolean;
  /** When true, prefer EIP-5792 `wallet_sendCalls` (atomic batch path). */
  supportsAtomicBatch: boolean;
  /** Visual variant (glow when many unclaimed clicks). */
  highlight: boolean;
  theme: UiTheme;
  onConfirmed: () => void;
};

export function ClaimTokensButton({
  amount,
  disabled,
  supportsAtomicBatch,
  highlight,
  theme,
  onConfirmed,
}: ClaimTokensButtonProps) {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { address, status } = useConnection();
  const [phase, setPhase] = useState<"idle" | "batch" | "legacy">("idle");

  const { sendCallsAsync, isPending: isSendCallsPending } = useSendCalls();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const invalidateReads = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const handleClick = useCallback(async () => {
    if (disabled || amount <= BigInt(0) || status !== "connected" || !address) {
      return;
    }

    try {
      if (supportsAtomicBatch) {
        setPhase("batch");
        try {
          const { id } = await sendCallsAsync({
            calls: [
              {
                abi: BAZA_TOKEN_ABI,
                to: BAZA_TOKEN_ADDRESS,
                functionName: "claimTokens",
                args: [amount],
              },
            ],
            capabilities: BAZA_BUILDER_SEND_CALLS_CAPABILITIES,
          });
          await waitForCallsStatus(config, { id });
        } catch {
          setPhase("legacy");
          const hash = await writeContractAsync({
            address: BAZA_TOKEN_ADDRESS,
            abi: BAZA_TOKEN_ABI,
            functionName: "claimTokens",
            args: [amount],
            dataSuffix: BAZA_BUILDER_DATA_SUFFIX,
          });
          await waitForTransactionReceipt(config, { hash });
        }
      } else {
        setPhase("legacy");
        const hash = await writeContractAsync({
          address: BAZA_TOKEN_ADDRESS,
          abi: BAZA_TOKEN_ABI,
          functionName: "claimTokens",
          args: [amount],
          dataSuffix: BAZA_BUILDER_DATA_SUFFIX,
        });
        await waitForTransactionReceipt(config, { hash });
      }

      await invalidateReads();
      onConfirmed();
    } finally {
      setPhase("idle");
    }
  }, [
    address,
    amount,
    config,
    disabled,
    invalidateReads,
    onConfirmed,
    queryClient,
    sendCallsAsync,
    status,
    supportsAtomicBatch,
    writeContractAsync,
  ]);

  const isPending =
    isSendCallsPending || isWritePending || phase !== "idle";

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || isPending}
      className={`w-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        highlight ? theme.claimHighlightClass : theme.claimClass
      }`}
    >
      {isPending ? (
        <span className="inline-flex items-center gap-2">
          <motion.span
            className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
          {phase === "batch" ? "Confirm batch…" : "Transaction pending…"}
        </span>
      ) : (
        "Claim to wallet"
      )}
    </button>
  );
}
