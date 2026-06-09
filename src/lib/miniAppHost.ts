import sdk from "@farcaster/frame-sdk";

/** Official Warpcast client FID (Farcaster mini app host). */
export const WARPCAST_CLIENT_FID = 9152;

export type AppHost = "browser" | "farcaster" | "base-app";

/**
 * Base App in-app browser (standard web apps opened inside the Base mobile app).
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */
export function isBaseAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /\bBase\b/i.test(navigator.userAgent);
}

/**
 * Distinguish Warpcast from Base App.
 * Both can return `isInMiniApp() === true`, but only Warpcast should use the Farcaster wallet connector.
 */
export async function detectAppHost(): Promise<AppHost> {
  if (typeof window === "undefined") return "browser";

  try {
    const inMiniApp = await sdk.isInMiniApp();
    if (inMiniApp) {
      const context = await sdk.context;
      if (context.client.clientFid === WARPCAST_CLIENT_FID) {
        return "farcaster";
      }
      return "base-app";
    }
  } catch {
    // Fall through to UA-based detection.
  }

  if (isBaseAppBrowser()) {
    return "base-app";
  }

  return "browser";
}

export function isFarcasterHost(host: AppHost) {
  return host === "farcaster";
}

export function isBaseAppHost(host: AppHost) {
  return host === "base-app";
}
