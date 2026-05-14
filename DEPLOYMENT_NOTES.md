# Deployment notes (BAZA)

Use this file as a **private scratchpad** for deploy metadata.  
Do **not** put private keys or mnemonics here — only public on-chain data.

## Base Mainnet (chain id `8453`)

| Field | Value |
|--------|--------|
| **BazaToken address** | _paste from Remix after deploy_ |
| **Deploy tx hash** | |
| **Date** | |
| **Remix / tool version** | |

After you fill the address above, copy it into:

`src/config/contracts.ts` → `BAZA_TOKEN_ADDRESS`

Then rebuild / redeploy the frontend if needed.

## Optional

- Block explorer link to the verified contract  
- Any proxy / implementation addresses if you upgrade later  
