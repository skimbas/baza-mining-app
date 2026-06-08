import {
  BAZA_BUILDER_DATA_SUFFIX,
} from "@/config/builderCode";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
} from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp } from "@/config/farcasterMiniAppConnector";
import { baseAccount, injected } from "wagmi/connectors";

const BASE_MAINNET_RPC = "https://mainnet.base.org";

let wagmiConfig: ReturnType<typeof createConfig> | undefined;

/**
 * Wagmi config for Next.js App Router (SSR + cookie persistence).
 * Singleton — same instance for SSR `cookieToInitialState` and client provider.
 */
export function getConfig() {
  wagmiConfig ??= createConfig({
    chains: [base],
    connectors: [
      farcasterMiniApp(),
      baseAccount({ appName: "BAZA" }),
      injected({ target: "metaMask" }),
    ],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [base.id]: http(BASE_MAINNET_RPC),
    },
    dataSuffix: BAZA_BUILDER_DATA_SUFFIX,
  });
  return wagmiConfig;
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
