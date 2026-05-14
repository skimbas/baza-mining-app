# BAZA Mining App

Next.js frontend for **BAZA** on **Base Mainnet** (chain id `8453`): wallet connect, off-chain clicker with energy, on-chain **$BAZA** claims, and **7-day check-in streaks** against the deployed Baza token.

## Live contract (Base Mainnet)

- **BazaToken:** [`0x685cD8bBC7EDac563024D798f19D12fdb2A89887` on Basescan](https://basescan.org/address/0x685cD8bBC7EDac563024D798f19D12fdb2A89887#code) (source verified).
- App config: `src/config/contracts.ts` → `BAZA_TOKEN_ADDRESS` (must stay in sync with the on-chain deployment).

More deploy / verify notes: `DEPLOYMENT_NOTES.md`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use a wallet on **Base Mainnet** so reads and writes hit the same chain as `BAZA_CHAIN` / `BAZA_TOKEN_ADDRESS`.

Production build:

```bash
npm run build
```

## Submodules

This repo uses Git submodules (`based-puzzle3`, `contract`). After clone:

```bash
git submodule update --init --recursive
```

The `contract` entry points at `https://github.com/skimbas/base-puzzle-contract.git`. If that repository does not exist yet or you use a fork, set your URL before updating:

```bash
git config submodule.contract.url https://github.com/<you>/<your-forge-repo>.git
git submodule update --init --recursive
```

## Mechanics (short)

- **7-day streaks:** `dailyCheckIn` on the token; rewards **10 $BAZA** on days 1–6 and **20 $BAZA** on day 7 (see `contracts/BazaToken.sol`).
- **Clicker:** local taps build an unclaimed balance; **Claim to wallet** calls `claimTokens` on-chain.
- **Energy:** taps consume energy that refills over time (UI only).

## Stack

Next.js (App Router), React, Tailwind CSS, wagmi/viem, Framer Motion, canvas-confetti (day-7 streak).

---

## Backup deploy keys (important)

**Never commit private keys or mnemonics.** Keep them in a password manager, hardware wallet, or local `.env` / keystores outside public repos.

After any deploy, reconcile on-chain `name` / `symbol` / bytecode with `contracts/BazaToken.sol`; update `BAZA_TOKEN_ADDRESS` when you ship a new token.
