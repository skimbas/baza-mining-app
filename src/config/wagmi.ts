import { BAZA_CHAIN } from "@/config/contracts";
import { createConfig, http } from "wagmi";
import { baseAccount, injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [BAZA_CHAIN],
  connectors: [
    injected({ target: "metaMask" }),
    baseAccount({
      appName: "BAZA Mining App",
    }),
  ],
  transports: {
    [BAZA_CHAIN.id]: http(),
  },
});
