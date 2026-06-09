import sdk from "@farcaster/frame-sdk";
import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  http,
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Hash,
  type Hex,
} from "viem";

type FarcasterWriteContractParameters = {
  chain: Chain;
  account: Account | Address;
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  rpcUrl: string;
};

export async function getFarcasterEthereumProvider() {
  const provider = await sdk.wallet.getEthereumProvider();
  if (!provider) {
    throw new Error("Farcaster wallet provider is not available");
  }
  return provider;
}

/** Write via the Warpcast host wallet without wagmi simulation/middleware. */
export async function farcasterWriteContract(
  parameters: FarcasterWriteContractParameters,
): Promise<Hash> {
  const provider = await getFarcasterEthereumProvider();
  const walletClient = createWalletClient({
    account: parameters.account,
    chain: parameters.chain,
    transport: custom(provider),
  });

  const data = encodeFunctionData({
    abi: parameters.abi,
    functionName: parameters.functionName,
    args: parameters.args ?? [],
  });

  return walletClient.sendTransaction({
    account: parameters.account,
    chain: parameters.chain,
    to: parameters.address,
    data,
  });
}

export async function waitForFarcasterTransaction(
  chain: Chain,
  rpcUrl: string,
  hash: Hex,
) {
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  return publicClient.waitForTransactionReceipt({ hash });
}
