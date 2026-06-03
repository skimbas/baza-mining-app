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

function parseStoredState(raw: string | null): ShareBonusTimestamps {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const state: ShareBonusTimestamps = {};

    for (const platform of ["farcaster", "twitter"] as const) {
      const value = parsed[platform];
      if (typeof value === "number" && Number.isFinite(value)) {
        state[platform] = value;
      } else if (value === true) {
        // Migrate one-time boolean claims to timestamp-based cooldown.
        state[platform] = Date.now();
      }
    }

    return state;
  } catch {
    return {};
  }
}

function readState(address: string | undefined): ShareBonusTimestamps {
  if (typeof window === "undefined" || !address) return {};
  return parseStoredState(window.localStorage.getItem(storageKey(address)));
}

function writeState(address: string, state: ShareBonusTimestamps) {
  window.localStorage.setItem(storageKey(address), JSON.stringify(state));
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
  const [timestamps, setTimestamps] = useState<ShareBonusTimestamps>(() =>
    readState(address),
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

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
      if (!address || isOnCooldown(platform)) return false;
      const next = { ...timestamps, [platform]: Date.now() };
      writeState(address, next);
      setTimestamps(next);
      return true;
    },
    [address, isOnCooldown, timestamps],
  );

  return {
    shareBonusTaps: SHARE_BONUS_TAPS,
    shareBonusCooldownMs: SHARE_BONUS_COOLDOWN_MS,
    isOnCooldown,
    getCooldownRemainingMs,
    claimBonus,
  };
}
