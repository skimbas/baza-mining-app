"use client";

import { BAZA_CHAIN } from "@/config/contracts";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type WrongNetworkPromptProps = {
  open: boolean;
  isSwitching: boolean;
  onSwitch: () => void;
};

export function WrongNetworkPrompt({
  open,
  isSwitching,
  onSwitch,
}: WrongNetworkPromptProps) {
  const [dismissed, setDismissed] = useState(false);

  const showModal = open && !dismissed;
  const showBanner = open && dismissed;

  return (
    <>
      <AnimatePresence>
        {showModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wrong-network-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-sm rounded-2xl border border-orange-500/35 bg-slate-900 p-6 shadow-[0_0_60px_rgba(249,115,22,0.15)]"
            >
              <div className="mb-2 text-center text-3xl" aria-hidden>
                ⚠️
              </div>
              <h2
                id="wrong-network-title"
                className="text-center text-lg font-semibold text-slate-100"
              >
                Wrong network
              </h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-slate-400">
                Your wallet is not on{" "}
                <span className="font-medium text-blue-300">{BAZA_CHAIN.name}</span>.
                Switch to mine, check in, and claim $BAZA.
              </p>

              <button
                type="button"
                onClick={onSwitch}
                disabled={isSwitching}
                className="mt-5 w-full rounded-xl bg-[#0052FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {isSwitching ? "Switching…" : `Switch to ${BAZA_CHAIN.name}`}
              </button>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                disabled={isSwitching}
                className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:text-slate-200 disabled:opacity-50"
              >
                Later
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showBanner ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-0 z-[55] px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
            role="status"
          >
            <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-xl border border-orange-500/40 bg-orange-950/90 px-4 py-3 backdrop-blur">
              <p className="text-xs text-orange-100 sm:text-sm">
                Switch to {BAZA_CHAIN.name} to use BAZA
              </p>
              <button
                type="button"
                onClick={onSwitch}
                disabled={isSwitching}
                className="shrink-0 rounded-lg bg-[#0052FF] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:bg-slate-600"
              >
                {isSwitching ? "…" : "Switch"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
