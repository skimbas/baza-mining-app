# Deployment notes (BAZA)

Public on-chain metadata only — **never** commit private keys or mnemonics.

## Base Mainnet (chain id `8453`)

| Field | Value |
|--------|--------|
| **Network** | Base Mainnet |
| **BazaToken address** | `0x685cD8bBC7EDac563024D798f19D12fdb2A89887` |
| **Basescan (verified source)** | [Contract on Basescan](https://basescan.org/address/0x685cD8bBC7EDac563024D798f19D12fdb2A89887#code) |
| **Verification** | Source code verified (exact match) on Basescan |
| **Deploy tx hash** | _(optional — paste from wallet / explorer)_ |
| **Date** | 2026-05-15 |
| **Remix / compiler** | _(optional — e.g. Solidity 0.8.x used in Remix)_ |

Frontend reads the token address from `src/config/contracts.ts` → `BAZA_TOKEN_ADDRESS`.

## Vercel environment variables

In **Project → Settings → Environment Variables**, add:

| Variable | Example value | Environments | Notes |
|----------|---------------|--------------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://baza-mining-app.vercel.app` | Production, Preview, Development | Fixes OG/Farcaster preview URLs |
| `NEXT_PUBLIC_BASE_BUILDER_CODE` | `bc_5urownup` | All | On-chain attribution |
| `NEXT_PUBLIC_FARCASTER_MINIAPP_URL` | `https://farcaster.xyz/miniapps/DwoLrAk1IJA-/baza-mining` | All | Share button embed link |
| `ALCHEMY_API_KEY` | `…` from Alchemy dashboard | Production, Preview | Faster RPC (recommended) |
| `BASE_RPC_URL` | `https://base-mainnet.g.alchemy.com/v2/…` | Production | Alternative to `ALCHEMY_API_KEY` |
| `BAZA_TOKEN_DEPLOY_BLOCK` | `46494397` | Production | Speeds up global tx counter |

**Do not** add `FARCASTER_CUSTODY_PRIVATE_KEY` to Vercel — use only locally for manifest signing.

After adding variables, **Redeploy** the project so Next.js picks them up.

## Alchemy RPC (recommended)

1. Open [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. **Create new app**
   - Name: `BAZA`
   - Chain: **Base**
   - Network: **Base Mainnet**
3. Open the app → **API Key** → copy the key (not the full URL)
4. Add to **Vercel → Environment Variables**:
   - Key: `ALCHEMY_API_KEY`
   - Value: your API key
   - Environments: Production, Preview, Development
5. **Redeploy** the project

Local test (create `.env.local` from `.env.example`):

```bash
ALCHEMY_API_KEY=your_key npm run check:rpc
```

Expected output: `RPC OK`, chain id `8453`, latest block number.

**Important:** use `ALCHEMY_API_KEY` (server-only). Do not expose the key in `NEXT_PUBLIC_*` variables.

## Verify again (after upgrades)

Source of truth for bytecode: **`contracts/BazaToken.sol`**, contract name **`BazaToken`**. The nested **`contract/`** Foundry app is a different stack (OZ `BAZA`); do not mix them for this token.

- **Foundry (repo root):** `foundry.toml` + `./scripts/verify-baza-token.sh <address>` — see script header and `ETHERSCAN_API_KEY`.
- **Basescan UI:** [Verify contract](https://basescan.org/verifyContract).

## Farcaster Mini App manifest

- File: `public/.well-known/farcaster.json` → `https://baza-mining-app.vercel.app/.well-known/farcaster.json`
- **Warpcast:** Manifests → Create → domain `baza-mining-app.vercel.app` → **Verify**
- **`accountAssociation`** must be signed (empty placeholders in repo until you generate them):
  - [Farcaster Developers](https://farcaster.xyz/~/developers) or Base manifest signer
  - Paste `header`, `payload`, `signature` into the JSON, then redeploy
- **Emulator:** test URL `https://baza-mining-app.vercel.app` before publishing
- Icon spec: 1024×1024 PNG (replace `public/logo.png` when you have final art)

## Optional

- Proxy / implementation addresses if you upgrade later
