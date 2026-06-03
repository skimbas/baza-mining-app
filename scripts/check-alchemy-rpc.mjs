#!/usr/bin/env node
/**
 * Verify Base RPC connectivity (Alchemy or BASE_RPC_URL).
 *
 * Usage:
 *   ALCHEMY_API_KEY=your_key npm run check:rpc
 *   BASE_RPC_URL=https://... npm run check:rpc
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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

function getRpcUrl() {
  if (process.env.BASE_RPC_URL) return process.env.BASE_RPC_URL;
  if (process.env.ALCHEMY_API_KEY) {
    return `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  }
  return "https://mainnet.base.org";
}

loadDotEnv(join(ROOT, ".env.local"));

const rpcUrl = getRpcUrl();
const masked =
  rpcUrl.includes("/v2/")
    ? rpcUrl.replace(/\/v2\/[^/?]+/, "/v2/***")
    : rpcUrl;

const client = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

try {
  const [blockNumber, chainId] = await Promise.all([
    client.getBlockNumber(),
    client.getChainId(),
  ]);

  console.log("RPC OK");
  console.log("Endpoint:", masked);
  console.log("Chain id:", chainId);
  console.log("Latest block:", blockNumber.toString());
} catch (error) {
  console.error("RPC check failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
