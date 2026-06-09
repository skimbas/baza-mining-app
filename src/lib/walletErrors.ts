import { UserRejectedRequestError } from "viem";

export function isUserRejection(error: unknown) {
  if (error instanceof UserRejectedRequestError) return true;
  const candidate = error as { code?: number; name?: string };
  return (
    candidate?.code === 4001 || candidate?.name === "UserRejectedRequestError"
  );
}

/** True when `wallet_sendCalls` is unavailable — safe to fall back to `writeContract`. */
export function isSendCallsUnsupported(error: unknown) {
  if (isUserRejection(error)) return false;

  const candidate = error as { code?: number; name?: string; message?: string };
  if (candidate?.code === 4100 || candidate?.code === 4200) return true;

  const message = candidate?.message?.toLowerCase() ?? "";
  return (
    message.includes("not supported") ||
    message.includes("method_not_supported") ||
    message.includes("unsupported")
  );
}
