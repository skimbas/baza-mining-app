#!/usr/bin/env node
/**
 * Generates public/.well-known/farcaster.json with a valid accountAssociation (JFS).
 *
 * Required env:
 *   FARCASTER_CUSTODY_PRIVATE_KEY — custody wallet private key (0x…)
 *
 * Optional env:
 *   FARCASTER_FID — Farcaster FID (auto-resolved from custody address if omitted)
 *   FARCASTER_DOMAIN — domain without scheme (default: baza-mining-app.vercel.app)
 *
 * Loads .env.local from repo root when present (gitignored).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  encodeHeader,
  encodePayload,
  encodeSignature,
  verify,
} from "@farcaster/jfs";
import { createPublicClient, http, hexToBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimism } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MANIFEST_PATH = join(ROOT, "public/.well-known/farcaster.json");
const ID_REGISTRY = "0x00000000Fc6c5F01Fc4011634a6f475c76e6e938";

const DEFAULT_DOMAIN = "baza-mining-app.vercel.app";

const FRAME = {
  version: "1",
  name: "BAZA Mining",
  iconUrl: "https://baza-mining-app.vercel.app/logo.png",
  homeUrl: "https://baza-mining-app.vercel.app",
  imageUrl: "https://baza-mining-app.vercel.app/logo.png",
  buttonTitle: "Start Mining",
  splashImageUrl: "https://baza-mining-app.vercel.app/logo.png",
  splashBackgroundColor: "#0052FF",
};

const idRegistryAbi = [
  {
    type: "function",
    name: "idOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "custodyOf",
    stateMutability: "view",
    inputs: [{ name: "fid", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
];

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function normalizePrivateKey(raw) {
  const key = raw.trim();
  return key.startsWith("0x") ? key : `0x${key}`;
}

async function resolveFid(publicClient, custodyAddress, fidFromEnv) {
  if (fidFromEnv) {
    const fid = Number(fidFromEnv);
    if (!Number.isInteger(fid) || fid <= 0) {
      throw new Error("FARCASTER_FID must be a positive integer");
    }
    const onChainCustody = await publicClient.readContract({
      address: ID_REGISTRY,
      abi: idRegistryAbi,
      functionName: "custodyOf",
      args: [BigInt(fid)],
    });
    if (onChainCustody.toLowerCase() !== custodyAddress.toLowerCase()) {
      throw new Error(
        `FARCASTER_FID=${fid} custody is ${onChainCustody}, but your key address is ${custodyAddress}. Use the custody private key for this FID.`,
      );
    }
    return fid;
  }

  const fid = await publicClient.readContract({
    address: ID_REGISTRY,
    abi: idRegistryAbi,
    functionName: "idOf",
    args: [custodyAddress],
  });
  const fidNumber = Number(fid);
  if (!fidNumber) {
    throw new Error(
      `No Farcaster ID found for custody address ${custodyAddress}. Register an account or set FARCASTER_FID explicitly.`,
    );
  }
  return fidNumber;
}

async function signAccountAssociation({ fid, custodyAddress, domain, privateKey }) {
  const account = privateKeyToAccount(normalizePrivateKey(privateKey));
  if (account.address.toLowerCase() !== custodyAddress.toLowerCase()) {
    throw new Error(
      `Private key address ${account.address} does not match expected custody ${custodyAddress}`,
    );
  }

  const header = { fid, type: "custody", key: account.address };
  const payload = { domain };

  const encodedHeader = encodeHeader(header);
  const encodedPayload = encodePayload(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signatureHex = await account.signMessage({ message: signingInput });
  const encodedSignature = encodeSignature(hexToBytes(signatureHex));

  const accountAssociation = {
    header: encodedHeader,
    payload: encodedPayload,
    signature: encodedSignature,
  };

  await verify({ data: accountAssociation, keyTypes: ["custody"], strict: true });

  return accountAssociation;
}

async function main() {
  loadDotEnv(join(ROOT, ".env.local"));

  const privateKey = process.env.FARCASTER_CUSTODY_PRIVATE_KEY;
  const domain = (process.env.FARCASTER_DOMAIN || DEFAULT_DOMAIN)
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  if (!privateKey) {
    console.error(
      [
        "Missing FARCASTER_CUSTODY_PRIVATE_KEY.",
        "",
        "Create .env.local (gitignored) with:",
        "  FARCASTER_CUSTODY_PRIVATE_KEY=0x...",
        "  # optional:",
        "  FARCASTER_FID=12345",
        "  FARCASTER_DOMAIN=baza-mining-app.vercel.app",
        "",
        "Then run: npm run generate:manifest",
      ].join("\n"),
    );
    process.exit(1);
  }

  const account = privateKeyToAccount(normalizePrivateKey(privateKey));
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  const fid = await resolveFid(
    publicClient,
    account.address,
    process.env.FARCASTER_FID,
  );

  console.log(`Custody: ${account.address}`);
  console.log(`FID: ${fid}`);
  console.log(`Domain: ${domain}`);

  const accountAssociation = await signAccountAssociation({
    fid,
    custodyAddress: account.address,
    domain,
    privateKey,
  });

  const manifest = { accountAssociation, frame: FRAME };
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Wrote ${MANIFEST_PATH}`);
  console.log("Local verify: OK (JFS custody signature)");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
