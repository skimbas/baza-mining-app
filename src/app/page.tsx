import { AddAppPrompt } from "@/components/AddAppPrompt";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function Home() {
  return (
    <>
      <ConnectWallet />
      <AddAppPrompt />
    </>
  );
}
