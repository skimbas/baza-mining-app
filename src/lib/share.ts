const DEFAULT_APP_ORIGIN = "https://baza-mining-app.vercel.app";

export function getAppOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL != null
      ? `https://${process.env.VERCEL_URL}`
      : DEFAULT_APP_ORIGIN)
  );
}

export function buildShareMessage(streak?: bigint) {
  const streakLine =
    streak != null && streak > BigInt(0)
      ? ` 🔥 Streak: ${streak.toString()}`
      : "";
  return `I'm mining $BAZA on Base!${streakLine} Join me and build your streak:`;
}

export function buildFarcasterShareUrl(streak?: bigint) {
  const origin = getAppOrigin();
  const params = new URLSearchParams({
    text: buildShareMessage(streak),
    "embeds[]": origin,
  });
  return `https://warpcast.com/~/compose?${params.toString()}`;
}

export function buildTwitterShareUrl(streak?: bigint) {
  const origin = getAppOrigin();
  const params = new URLSearchParams({
    text: buildShareMessage(streak),
    url: origin,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
