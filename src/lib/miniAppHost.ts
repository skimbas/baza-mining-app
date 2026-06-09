import sdk from "@farcaster/frame-sdk";

/** Official Warpcast client FID (Farcaster mini app host). */
export const WARPCAST_CLIENT_FID = 9152;

export type AppHost = "browser" | "farcaster" | "base-app";

type EthereumProvider = {
  isCoinbaseBrowser?: boolean;
  isCoinbaseWallet?: boolean;
  isBase?: boolean;
};

/**
 * Base App in-app browser (standard web apps opened inside the Base mobile app).
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */
export function isBaseAppBrowser() {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  if (/\bBase\b/i.test(ua) || /BaseApp/i.test(ua)) return true;

  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (
    ethereum?.isCoinbaseBrowser ||
    ethereum?.isCoinbaseWallet ||
    ethereum?.isBase
  ) {
    return true;
  }

  if (
    typeof document !== "undefined" &&
    /base\.app/i.test(document.referrer)
  ) {
    return true;
  }

  const webView = (window as Window & { ReactNativeWebView?: unknown })
    .ReactNativeWebView;
  if (webView && /iPhone|iPad|iPod|Android/i.test(ua)) {
    return true;
  }

  return false;
}

/** Apply sync heuristics on top of async host detection. */
export function resolveAppHost(host: AppHost | null): AppHost | null {
  if (host === "farcaster") return host;
  if (isBaseAppBrowser()) return "base-app";
  return host;
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
    // Fall through to UA/provider-based detection.
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
