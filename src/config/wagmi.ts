import {
  BAZA_BUILDER_DATA_SUFFIX,
} from "@/config/builderCode";
import { getBaseRpcUrl } from "@/config/rpc";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
} from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

const BASE_MAINNET_RPC = getBaseRpcUrl();

/**
 * Wagmi config for Next.js App Router (SSR + cookie persistence).
 * Call once per client `Providers` mount via `useState(() => getConfig())`.
 */
export function getConfig() {
  return createConfig({
    chains: [base],
    connectors: [
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
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
