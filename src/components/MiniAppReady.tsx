"use client";

import { useEffect } from "react";

/** Signal mini-app host ASAP — must not sit behind heavy dynamic imports. */
export function MiniAppReady() {
  useEffect(() => {
    void import("@farcaster/frame-sdk")
      .then(({ default: sdk }) => sdk.actions.ready())
      .catch(() => {
        // Not inside a mini app host — no-op.
      });
  }, []);

  return null;
}
