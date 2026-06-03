"use client";

import {
  buildFarcasterShareUrl,
  buildTwitterShareUrl,
} from "@/lib/share";
import {
  type SharePlatform,
  useShareBonus,
} from "@/hooks/useShareBonus";
import { useState } from "react";

type ShareBonusButtonsProps = {
  address: string;
  streak: bigint;
  onBonusGranted: (platform: SharePlatform, taps: number) => void;
};

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ShareBonusButtons({
  address,
  streak,
  onBonusGranted,
}: ShareBonusButtonsProps) {
  const { shareBonusTaps, isClaimed, claimBonus } = useShareBonus(address);
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = (platform: SharePlatform) => {
    if (isClaimed(platform)) return;

    const url =
      platform === "farcaster"
        ? buildFarcasterShareUrl(streak)
        : buildTwitterShareUrl(streak);

    openShareWindow(url);

    const granted = claimBonus(platform);
    if (granted) {
      onBonusGranted(platform, shareBonusTaps);
      setToast(`+${shareBonusTaps} bonus taps!`);
      window.setTimeout(() => setToast(null), 2800);
    }
  };

  const farcasterDone = isClaimed("farcaster");
  const twitterDone = isClaimed("twitter");

  return (
    <div className="mb-4 rounded-2xl border border-slate-700/80 bg-slate-950/50 p-4">
      <div className="mb-3 text-center">
        <p className="text-sm font-semibold text-slate-100">
          Share &amp; get bonus
        </p>
        <p className="mt-1 text-xs text-slate-400">
          +{shareBonusTaps} unclaimed $BAZA per network (once each)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleShare("farcaster")}
          disabled={farcasterDone}
          className="rounded-xl border border-violet-500/40 bg-violet-950/40 px-3 py-2.5 text-sm font-medium text-violet-100 transition hover:border-violet-400/60 hover:bg-violet-900/50 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/60 disabled:text-slate-500"
        >
          {farcasterDone ? "Farcaster ✓" : "Share on Farcaster"}
        </button>

        <button
          type="button"
          onClick={() => handleShare("twitter")}
          disabled={twitterDone}
          className="rounded-xl border border-sky-500/40 bg-sky-950/40 px-3 py-2.5 text-sm font-medium text-sky-100 transition hover:border-sky-400/60 hover:bg-sky-900/50 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/60 disabled:text-slate-500"
        >
          {twitterDone ? "X ✓" : "Share on X"}
        </button>
      </div>

      {toast ? (
        <p
          className="mt-3 text-center text-sm font-medium text-emerald-300"
          role="status"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}
