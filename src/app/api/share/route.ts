import { buildFarcasterShareUrl } from "@/lib/share";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const streakParam = request.nextUrl.searchParams.get("streak");
  const streak =
    streakParam != null && /^\d+$/.test(streakParam)
      ? BigInt(streakParam)
      : undefined;

  return NextResponse.redirect(buildFarcasterShareUrl(streak), 302);
}
