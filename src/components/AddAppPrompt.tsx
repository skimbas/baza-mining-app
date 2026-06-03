"use client";

import sdk from "@farcaster/frame-sdk";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DISMISS_KEY = "baza-add-app-dismissed";
const ADDED_KEY = "baza-add-app-added";

export function AddAppPrompt() {
  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const onAdded = () => {
      localStorage.setItem(ADDED_KEY, "1");
      setVisible(false);
    };

    sdk.on("miniAppAdded", onAdded);

    void (async () => {
      if (
        localStorage.getItem(DISMISS_KEY) === "1" ||
        localStorage.getItem(ADDED_KEY) === "1"
      ) {
        return;
      }

      const inMiniApp = await sdk.isInMiniApp();
      if (!inMiniApp || cancelled) return;

      await new Promise((resolve) => window.setTimeout(resolve, 900));
      if (!cancelled) setVisible(true);
    })();

    return () => {
      cancelled = true;
      sdk.off("miniAppAdded", onAdded);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      await sdk.actions.addMiniApp();
      localStorage.setItem(ADDED_KEY, "1");
      setVisible(false);
    } catch {
      // User rejected or manifest/domain mismatch — keep prompt dismissible.
    } finally {
      setAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          role="dialog"
          aria-labelledby="add-app-title"
        >
          <div className="mx-auto max-w-xl rounded-2xl border border-blue-500/30 bg-slate-900/95 p-4 shadow-[0_-8px_40px_rgba(0,82,255,0.25)] backdrop-blur">
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0052FF] text-sm font-black tracking-wider text-white">
                B
              </div>
              <div>
                <p
                  id="add-app-title"
                  className="text-sm font-semibold text-slate-100"
                >
                  Add BAZA to your apps
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Quick access from your feed and streak reminders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={adding}
                className="rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 disabled:opacity-50"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => void handleAdd()}
                disabled={adding}
                className="rounded-xl bg-[#0052FF] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {adding ? "Adding…" : "Add app"}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
