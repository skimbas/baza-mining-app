"use client";

import {
  buildFarcasterShareUrl,
  buildTwitterShareUrl,
} from "@/lib/share";
import {
  type SharePlatform,
  useShareBonus,
} from "@/hooks/useShareBonus";
import type { UiTheme } from "@/config/uiThemes";
import { useState } from "react";

type ShareBonusButtonsProps = {
  address: string;
  streak: bigint;
  theme: UiTheme;
  onBonusGranted: (platform: SharePlatform, taps: number) => void;
};

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function formatCooldown(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ShareBonusButtons({
  address,
  streak,
  theme,
  onBonusGranted,
}: ShareBonusButtonsProps) {
  const {
    shareBonusTaps,
    isOnCooldown,
    getCooldownRemainingMs,
    claimBonus,
  } = useShareBonus(address);
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = (platform: SharePlatform) => {
    if (isOnCooldown(platform)) return;

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

  const renderButtonLabel = (
    platform: SharePlatform,
    activeLabel: string,
  ) => {
    const remaining = getCooldownRemainingMs(platform);
    if (remaining <= 0) return activeLabel;
    return `${formatCooldown(remaining)}`;
  };

  const farcasterCooldown = isOnCooldown("farcaster");
  const twitterCooldown = isOnCooldown("twitter");

  return (
    <div className={`mb-2 p-2.5 ${theme.shareBoxClass}`}>
      <div className="mb-2 text-center">
        <p className="text-xs font-semibold text-slate-100">Share &amp; get bonus</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
          +{shareBonusTaps} $BAZA per network · 1h cooldown
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => handleShare("farcaster")}
          disabled={farcasterCooldown}
          className={`px-2 py-2 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/60 disabled:text-slate-500 ${theme.shareFarcasterClass}`}
        >
          {renderButtonLabel("farcaster", "Farcaster")}
        </button>

        <button
          type="button"
          onClick={() => handleShare("twitter")}
          disabled={twitterCooldown}
          className={`px-2 py-2 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/60 disabled:text-slate-500 ${theme.shareTwitterClass}`}
        >
          {renderButtonLabel("twitter", "Share on X")}
        </button>
      </div>

      {toast ? (
        <p
          className="mt-2 text-center text-xs font-medium text-emerald-300"
          role="status"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}
