import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({ target: "metaMask" }),
    baseAccount({
      appName: "Base new game",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});
