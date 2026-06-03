/** Canonical production URL — used for OG/social when env vars are missing. */
export const PRODUCTION_SITE_URL = "https://baza-mining-app.vercel.app";

/** Resolve the public site origin for metadata, share links, and embeds. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
