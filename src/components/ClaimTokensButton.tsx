"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import {
  waitForCallsStatus,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import { useConfig, useConnection, useSendCalls } from "wagmi";

import {
  BAZA_BUILDER_DATA_SUFFIX,
  BAZA_BUILDER_SEND_CALLS_CAPABILITIES,
} from "@/config/builderCode";
import {
  BAZA_TOKEN_ABI,
  BAZA_TOKEN_ADDRESS,
} from "@/config/contracts";
import type { UiTheme } from "@/config/uiThemes";
import { isSendCallsUnsupported, isUserRejection } from "@/lib/walletErrors";

type ClaimTokensButtonProps = {
  /** Whole $BAZA units to mint (matches `claimTokens(uint256 amount)`). */
  amount: bigint;
  disabled: boolean;
  /** When true, prefer EIP-5792 `wallet_sendCalls` (atomic batch path). */
  supportsAtomicBatch: boolean;
  /** Append Base builder ERC-8021 suffix (not supported in Farcaster). */
  attachBuilderCode: boolean;
  /** Visual variant (glow when many unclaimed clicks). */
  highlight: boolean;
  theme: UiTheme;
  compact?: boolean;
  className?: string;
  onConfirmed: () => void;
};

export function ClaimTokensButton({
  amount,
  disabled,
  supportsAtomicBatch,
  attachBuilderCode,
  highlight,
  theme,
  compact = false,
  className,
  onConfirmed,
}: ClaimTokensButtonProps) {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { address, status } = useConnection();
  const [phase, setPhase] = useState<"idle" | "batch" | "legacy">("idle");

  const { sendCallsAsync, isPending: isSendCallsPending } = useSendCalls();

  const invalidateReads = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const handleClick = useCallback(async () => {
    if (disabled || amount <= BigInt(0) || status !== "connected" || !address) {
      return;
    }

    const writeExtras = attachBuilderCode
      ? { dataSuffix: BAZA_BUILDER_DATA_SUFFIX }
      : {};

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
        } catch (error) {
          if (isUserRejection(error) || !isSendCallsUnsupported(error)) {
            throw error;
          }

          setPhase("legacy");
          const hash = await writeContract(config, {
            address: BAZA_TOKEN_ADDRESS,
            abi: BAZA_TOKEN_ABI,
            functionName: "claimTokens",
            args: [amount],
            ...writeExtras,
          });
          await waitForTransactionReceipt(config, { hash });
        }
      } else {
        setPhase("legacy");
        const hash = await writeContract(config, {
          address: BAZA_TOKEN_ADDRESS,
          abi: BAZA_TOKEN_ABI,
          functionName: "claimTokens",
          args: [amount],
          ...writeExtras,
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
    attachBuilderCode,
    config,
    disabled,
    invalidateReads,
    onConfirmed,
    queryClient,
    sendCallsAsync,
    status,
    supportsAtomicBatch,
  ]);

  const isPending = isSendCallsPending || phase !== "idle";

  const pendingLabel =
    phase === "batch"
      ? compact
        ? "Batch…"
        : "Confirm batch…"
      : compact
        ? "Pending…"
        : "Transaction pending…";

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={disabled || isPending}
      className={`w-full min-w-0 px-2 py-2 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 sm:px-3 sm:text-xs ${
        highlight ? theme.claimHighlightClass : theme.claimClass
      } ${className ?? ""}`}
    >
      {isPending ? (
        <span className="inline-flex items-center justify-center gap-1.5">
          <motion.span
            className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white/50 border-t-white sm:h-4 sm:w-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
          {pendingLabel}
        </span>
      ) : compact ? (
        "Claim"
      ) : (
        "Claim to wallet"
      )}
    </button>
  );
}
