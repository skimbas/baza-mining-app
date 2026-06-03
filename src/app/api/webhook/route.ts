import { NextResponse } from "next/server";

/** Farcaster mini app webhook — manifest points here; events optional for now. */
export async function POST() {
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "baza-webhook" });
}
