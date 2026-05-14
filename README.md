# BAZA Mining App

Frontend for **BAZA** on **Base** (Mainnet, chain id `8453`): wallet connect, off-chain clicker with energy, on-chain **$BAZA** claims, and **7-day check-in streaks** tied to the Baza token contract.

## Contract (Base Mainnet)

Set **`BAZA_TOKEN_ADDRESS`** in `src/config/contracts.ts` after you deploy via Remix (see `DEPLOYMENT_NOTES.md` for a checklist).

Current placeholder in repo: `0x0000…0000` until you paste the real address.

## Mechanics (short)

- **7-day streaks:** `dailyCheckIn` on the token; streak position cycles every 7 days; rewards **10 $BAZA** on days 1–6 and **20 $BAZA** on day 7 (see `contracts/BazaToken.sol` and redeploy notes if you change logic).
- **Clicker:** local taps build “unclaimed” balance; **Claim to wallet** mints accumulated amount on-chain (`claimTokens`).
- **Energy:** taps consume energy that regenerates over time (UI only).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use a wallet on **Base Mainnet** and the token address configured in `src/config/contracts.ts`.

```bash
npm run build
```

## Stack

Next.js (App Router), React, Tailwind CSS, wagmi/viem, Framer Motion, canvas-confetti (day-7 streak).

---

## Backup your deploy keys (important)

**Private keys and mnemonics must never be committed to this repo.** Store them outside the project (password manager, hardware wallet, encrypted backup).

Typical places people keep deploy credentials (check what **you** actually use):

- **`.env` / `.env.local`** in the project or parent folder (often gitignored) — API keys, `PRIVATE_KEY`, `MNEMONIC`, RPC URLs.
- **Foundry / Cast:** keystores under something like **`.foundry/keystores/`** in your home directory, or env vars used when you ran `forge create` / `cast send`.
- **Shell profile** (`~/.zshrc`, `~/.bashrc`) if you ever exported a key (avoid this; prefer env files + secure backup).
- **Notes / password manager** where you saved the seed after deploy.

After a deploy you may also have **`deployed_address.txt`** in the repo (address only — safe to commit; it is not a secret). **Rotate anything that was ever pasted into chat or CI logs.**

Reconcile on-chain `symbol()` / bytecode with your local `contracts/BazaToken.sol` after upgrades; update `BAZA_TOKEN_ADDRESS` when you deploy a new token.
