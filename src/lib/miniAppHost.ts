import sdk from "@farcaster/frame-sdk";

/** Official Warpcast client FID (Farcaster mini app host). */
export const WARPCAST_CLIENT_FID = 9152;

export type AppHost = "browser" | "farcaster" | "base-app";

/**
 * Distinguish Warpcast from Base App.
 * Both can return `isInMiniApp() === true`, but only Warpcast should use the Farcaster wallet connector.
 */
export async function detectAppHost(): Promise<AppHost> {
  if (typeof window === "undefined") return "browser";

  if (!window.ReactNativeWebView && window === window.parent) {
    return "browser";
  }

  try {
    const inMiniApp = await sdk.isInMiniApp();
    if (!inMiniApp) return "browser";

    const context = await sdk.context;
    if (context.client.clientFid === WARPCAST_CLIENT_FID) {
      return "farcaster";
    }

    return "base-app";
  } catch {
    return "browser";
  }
}

export function isFarcasterHost(host: AppHost) {
  return host === "farcaster";
}
