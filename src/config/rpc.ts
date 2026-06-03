import { createPublicClient, fallback, http } from "viem";
import { base } from "viem/chains";

const PUBLIC_BASE_RPC = "https://mainnet.base.org";

/** Ordered RPC URLs for Base mainnet (server-side). */
export function getBaseRpcUrls(): string[] {
  const urls: string[] = [];

  if (process.env.BASE_RPC_URL) {
    urls.push(process.env.BASE_RPC_URL);
  }

  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (alchemyKey) {
    urls.push(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`);
  }

  if (process.env.NEXT_PUBLIC_BASE_RPC_URL) {
    urls.push(process.env.NEXT_PUBLIC_BASE_RPC_URL);
  }

  urls.push(PUBLIC_BASE_RPC);

  return [...new Set(urls)];
}

/** Primary RPC URL (client-safe single endpoint). */
export function getBaseRpcUrl() {
  return getBaseRpcUrls()[0] ?? PUBLIC_BASE_RPC;
}

/** Public client with automatic RPC fallback for server-side reads. */
export function createBasePublicClient() {
  return createPublicClient({
    chain: base,
    transport: fallback(
      getBaseRpcUrls().map((url) =>
        http(url, {
          timeout: 20_000,
          retryCount: 1,
        }),
      ),
    ),
  });
}
