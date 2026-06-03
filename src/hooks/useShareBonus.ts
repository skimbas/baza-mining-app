"use client";

import { useCallback, useEffect, useState } from "react";

export type SharePlatform = "farcaster" | "twitter";

export const SHARE_BONUS_TAPS = 3;
export const SHARE_BONUS_COOLDOWN_MS = 60 * 60 * 1000;

const STORAGE_PREFIX = "baza-share-bonus:";

type ShareBonusTimestamps = Partial<Record<SharePlatform, number>>;

function storageKey(address: string) {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

/** Load share timestamps and persist any one-time boolean → number migration. */
function loadAndMigrateState(address: string): ShareBonusTimestamps {
  if (typeof window === "undefined") return {};

  const key = storageKey(address);
  const raw = window.localStorage.getItem(key);
  let parsed: Record<string, unknown> = {};

  if (raw) {
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }

  const state: ShareBonusTimestamps = {};
  let needsPersist = false;

  for (const platform of ["farcaster", "twitter"] as const) {
    const value = parsed[platform];
    if (typeof value === "number" && Number.isFinite(value)) {
      state[platform] = value;
    } else if (value === true) {
      // Old one-time flag — drop it so hourly share can start fresh.
      needsPersist = true;
    }
  }

  if (needsPersist) {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage unavailable — in-memory state still applies for this session.
    }
  }

  return state;
}

function cooldownRemainingMs(
  platform: SharePlatform,
  timestamps: ShareBonusTimestamps,
  now = Date.now(),
) {
  const lastClaim = timestamps[platform];
  if (lastClaim == null) return 0;
  return Math.max(0, SHARE_BONUS_COOLDOWN_MS - (now - lastClaim));
}

export function useShareBonus(address: string | undefined) {
  const [timestamps, setTimestamps] = useState<ShareBonusTimestamps>({});
  const [now, setNow] = useState(() => Date.now());

  const reloadFromStorage = useCallback(() => {
    if (!address) {
      setTimestamps({});
      return;
    }
    setTimestamps(loadAndMigrateState(address));
  }, [address]);

  useEffect(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Mini app / mobile: re-read cooldown when user returns to the app.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        reloadFromStorage();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", reloadFromStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", reloadFromStorage);
    };
  }, [reloadFromStorage]);

  const isOnCooldown = useCallback(
    (platform: SharePlatform) =>
      cooldownRemainingMs(platform, timestamps, now) > 0,
    [timestamps, now],
  );

  const getCooldownRemainingMs = useCallback(
    (platform: SharePlatform) =>
      cooldownRemainingMs(platform, timestamps, now),
    [timestamps, now],
  );

  const claimBonus = useCallback(
    (platform: SharePlatform) => {
      if (!address) return false;

      const current = loadAndMigrateState(address);
      if (cooldownRemainingMs(platform, current) > 0) return false;

      const next = { ...current, [platform]: Date.now() };
      try {
        window.localStorage.setItem(
          storageKey(address),
          JSON.stringify(next),
        );
      } catch {
        return false;
      }
      setTimestamps(next);
      return true;
    },
    [address],
  );

  return {
    shareBonusTaps: SHARE_BONUS_TAPS,
    shareBonusCooldownMs: SHARE_BONUS_COOLDOWN_MS,
    isOnCooldown,
    getCooldownRemainingMs,
    claimBonus,
  };
}
