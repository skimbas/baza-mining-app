import { getSiteUrl, PRODUCTION_SITE_URL } from "@/lib/site";

/** Public Farcaster mini app page for casts and social shares. */
export const FARCASTER_MINIAPP_URL =
  process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_URL ??
  "https://farcaster.xyz/miniapps/DwoLrAk1IJA-/baza-mining";

export function getAppOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getSiteUrl();
}

export { PRODUCTION_SITE_URL as DEFAULT_APP_ORIGIN };

export function buildShareMessage(streak?: bigint) {
  const streakLine =
    streak != null && streak > BigInt(0)
      ? ` 🔥 Streak: ${streak.toString()}`
      : "";
  return `I'm mining $BAZA on Base!${streakLine} Join me and build your streak:`;
}

export function buildFarcasterShareUrl(streak?: bigint) {
  const params = new URLSearchParams({
    text: buildShareMessage(streak),
    "embeds[]": FARCASTER_MINIAPP_URL,
  });
  return `https://warpcast.com/~/compose?${params.toString()}`;
}

export function buildTwitterShareUrl(streak?: bigint) {
  const params = new URLSearchParams({
    text: buildShareMessage(streak),
    url: FARCASTER_MINIAPP_URL,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
