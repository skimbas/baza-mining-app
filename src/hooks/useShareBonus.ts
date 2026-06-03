"use client";

import { useCallback, useState } from "react";

export type SharePlatform = "farcaster" | "twitter";

export const SHARE_BONUS_TAPS = 3;

const STORAGE_PREFIX = "baza-share-bonus:";

type ShareBonusState = Record<SharePlatform, boolean>;

const EMPTY_STATE: ShareBonusState = {
  farcaster: false,
  twitter: false,
};

function storageKey(address: string) {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

function readState(address: string | undefined): ShareBonusState {
  if (typeof window === "undefined" || !address) return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<ShareBonusState>;
    return {
      farcaster: Boolean(parsed.farcaster),
      twitter: Boolean(parsed.twitter),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(address: string, state: ShareBonusState) {
  window.localStorage.setItem(storageKey(address), JSON.stringify(state));
}

export function useShareBonus(address: string | undefined) {
  const [claimed, setClaimed] = useState<ShareBonusState>(() =>
    readState(address),
  );

  const isClaimed = useCallback(
    (platform: SharePlatform) => claimed[platform],
    [claimed],
  );

  const claimBonus = useCallback(
    (platform: SharePlatform) => {
      if (!address || claimed[platform]) return false;
      const next = { ...claimed, [platform]: true };
      writeState(address, next);
      setClaimed(next);
      return true;
    },
    [address, claimed],
  );

  return {
    shareBonusTaps: SHARE_BONUS_TAPS,
    isClaimed,
    claimBonus,
  };
}
