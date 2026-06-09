"use client";

import { ClaimTokensButton } from "@/components/ClaimTokensButton";
import { ShareBonusButtons } from "@/components/ShareBonusButtons";
import { StreakVisual } from "@/components/StreakVisual";
import { ThemePicker } from "@/components/ThemePicker";
import { WrongNetworkPrompt } from "@/components/WrongNetworkPrompt";
import {
  BAZA_CHAIN,
  BAZA_TOKEN_ABI,
  BAZA_TOKEN_ADDRESS,
} from "@/config/contracts";
import { BAZA_BUILDER_DATA_SUFFIX } from "@/config/builderCode";
import { useClicker } from "@/hooks/useClicker";
import { useFarcasterAutoConnect } from "@/hooks/useFarcasterAutoConnect";
import { useUiTheme } from "@/hooks/useUiTheme";
import { useWalletCapabilities } from "@/hooks/useWalletCapabilities";
import { formatBzCompact, formatBzExact } from "@/lib/bzFormat";
import { resolveAppHost } from "@/lib/miniAppHost";
import {
  connectorLabel,
  filterVisibleConnectors,
} from "@/lib/walletConnectors";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useChainId,
  useConnect,
  useConnection,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

/** Repeating tile for watermark behind the mine button (white fill; layer uses opacity 0.05). */
const BAZA_WATERMARK_DATA_URI =
  'url("data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="104" height="72" viewBox="0 0 104 72">' +
      '<text x="6" y="22" fill="white" font-size="10" font-weight="700" font-family="ui-sans-serif,system-ui,sans-serif" letter-spacing="0.14em">BAZA</text>' +
      '<text x="54" y="50" fill="white" font-size="10" font-weight="700" font-family="ui-sans-serif,system-ui,sans-serif" letter-spacing="0.14em">BAZA</text>' +
      "</svg>",
  ) +
  '")';

const succeededTxHashes = new Set<string>();

/** Must match `BazaToken.MIN_CHECKIN_INTERVAL` after redeploy (24 hours). */
const CHECKIN_COOLDOWN_SEC = BigInt(86400);
/** Must match `STREAK_GRACE_PERIOD` in contract (48 hours). */
const STREAK_GRACE_SEC = BigInt(172800);

/** Square tap target shadows moved to uiThemes.ts */

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatCountdownSeconds(totalSeconds: bigint): string {
  if (totalSeconds <= BigInt(0)) return "0:00:00";
  const t = Number(totalSeconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
    status,
  } = useConnection();
  const { supportsAtomicBatch, supportsPaymasterService } =
    useWalletCapabilities();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnectPending } = useConnect();
  const { isBaseApp, isBootstrapping, appHost } = useFarcasterAutoConnect();
  const { theme, themeId, setThemeId, themes } = useUiTheme();
  const { disconnectAsync, isPending: isDisconnectPending } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync, data: txHash, isPending: isWritePending, reset: resetWriteContract } =
    useWriteContract();
  const {
    data: txReceipt,
    isLoading: isConfirmingTx,
    isSuccess: isTxConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const {
    clicks,
    energy,
    maxEnergy,
    energyPercent,
    claimTapProgressPercent,
    requiredTapsForClaim,
    canClick,
    particles,
    registerClick,
    resetClicks,
    addBonusTaps,
  } = useClicker();
  const txActionRef = useRef<"checkin" | null>(null);
  const [nowSec, setNowSec] = useState(() =>
    Math.floor(Date.now() / 1000),
  );
  const [coinHover, setCoinHover] = useState(false);
  const [coinPressedLocal, setCoinPressedLocal] = useState(false);

  const isCorrectNetwork = chainId === BAZA_CHAIN.id;

  const { data: streakData, refetch: refetchStreak } = useReadContract({
    address: BAZA_TOKEN_ADDRESS,
    abi: BAZA_TOKEN_ABI,
    functionName: "currentStreak",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isCorrectNetwork),
      refetchInterval: 5000,
    },
  });

  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: BAZA_TOKEN_ADDRESS,
    abi: BAZA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isCorrectNetwork),
      refetchInterval: 5000,
    },
  });

  const { data: lastCheckInData, refetch: refetchLastCheckIn } =
    useReadContract({
      address: BAZA_TOKEN_ADDRESS,
      abi: BAZA_TOKEN_ABI,
      functionName: "lastCheckIn",
      args: address ? [address] : undefined,
      query: {
        enabled: Boolean(address && isCorrectNetwork),
        refetchInterval: 5000,
      },
    });

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const streakBig =
    typeof streakData === "bigint" ? streakData : BigInt(0);
  const streakLabel = streakBig.toString();

  const balanceWei =
    typeof balanceData === "bigint" ? balanceData : BigInt(0);
  const balanceCompact = formatBzCompact(balanceWei);
  const balanceExact = formatBzExact(balanceWei);

  const lastCheckInSec =
    typeof lastCheckInData === "bigint" ? lastCheckInData : BigInt(0);

  const nowBig = BigInt(nowSec);
  const nextCheckInAt =
    lastCheckInSec > BigInt(0)
      ? lastCheckInSec + CHECKIN_COOLDOWN_SEC
      : BigInt(0);
  const cooldownRemaining =
    lastCheckInSec > BigInt(0) && nowBig < nextCheckInAt
      ? nextCheckInAt - nowBig
      : BigInt(0);
  const canDailyCheckIn =
    lastCheckInSec === BigInt(0) || nowBig >= nextCheckInAt;

  const streakBrokenUi =
    lastCheckInSec > BigInt(0) && nowBig > lastCheckInSec + STREAK_GRACE_SEC;

  const isCheckInPending = isWritePending || isConfirmingTx;
  const unclaimedBz = clicks;
  const tapsTowardClaim = Math.min(clicks, requiredTapsForClaim);
  const canClaim =
    unclaimedBz >= requiredTapsForClaim &&
    isCorrectNetwork &&
    !isCheckInPending;

  const coinInteractive = canClick && isCorrectNetwork;
  const mineShadow =
    coinPressedLocal && coinInteractive
      ? theme.mineShadowPressed
      : coinHover && coinInteractive
        ? theme.mineShadowHover
        : theme.mineShadowRest;

  const mineInnerInset =
    theme.mineShape === "circle" ? "inset-[3px]" : "inset-3 sm:inset-3.5";

  useEffect(() => {
    if (!txHash || !isTxConfirmed || !txReceipt) return;
    if (txReceipt.status !== "success") return;
    if (succeededTxHashes.has(txHash)) return;
    succeededTxHashes.add(txHash);
    if (succeededTxHashes.size > 64) {
      succeededTxHashes.clear();
    }

    const action = txActionRef.current;
    txActionRef.current = null;

    void (async () => {
      const streakResult = await refetchStreak();
      await refetchBalance();
      await refetchLastCheckIn();

      if (action === "checkin") {
        const s = streakResult.data;
        if (
          typeof s === "bigint" &&
          s > BigInt(0) &&
          s % BigInt(7) === BigInt(0)
        ) {
          const { fireSeventhDayConfetti } = await import(
            "@/lib/daySevenConfetti"
          );
          void fireSeventhDayConfetti();
        }
      }

    })();
  }, [
    txHash,
    isTxConfirmed,
    txReceipt,
    refetchBalance,
    refetchLastCheckIn,
    refetchStreak,
  ]);

  const handleDailyCheckIn = () => {
    if (isCheckInPending || !isCorrectNetwork || !canDailyCheckIn) return;
    txActionRef.current = "checkin";
    void (async () => {
      try {
        await writeContractAsync({
          address: BAZA_TOKEN_ADDRESS,
          abi: BAZA_TOKEN_ABI,
          functionName: "dailyCheckIn",
          dataSuffix: BAZA_BUILDER_DATA_SUFFIX,
        });
      } catch {
        txActionRef.current = null;
        resetWriteContract();
      }
    })();
  };

  const effectiveAppHost = resolveAppHost(appHost);

  const visibleConnectors = useMemo(
    () => filterVisibleConnectors(connectors, effectiveAppHost),
    [connectors, effectiveAppHost],
  );

  const [connectingConnectorUid, setConnectingConnectorUid] = useState<
    string | null
  >(null);

  const handleDisconnect = () => {
    void disconnectAsync();
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 text-sm">
          Loading wallet…
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    const statusLine = isReconnecting
      ? "Restoring your session… (tap a button if this takes too long)"
      : isDisconnected
        ? "Choose how to connect"
        : "Connect wallet to start mining BAZA";

    if (isBootstrapping) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 text-sm">
            {isBaseApp
              ? "Connecting Base Account…"
              : "Connecting Farcaster wallet…"}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex min-h-screen items-center justify-center px-3 py-3 ${theme.pageClass}`}
        style={theme.pageStyle}
      >
        <div
          className={`w-full max-w-md p-4 shadow-xl ${theme.cardClass}`}
        >
          <p className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
            {status === "reconnecting"
              ? "Reconnecting"
              : status === "connecting"
                ? "Connecting"
                : "Disconnected"}
          </p>
          <p className="mb-2 text-center text-xs text-slate-300 sm:text-sm">{statusLine}</p>
          <div className="flex flex-col gap-2">
            {visibleConnectors.map((connectorItem) => {
              const isThisPending =
                connectingConnectorUid === connectorItem.uid && isConnectPending;
              return (
              <button
                key={connectorItem.uid}
                type="button"
                disabled={isThisPending}
                onClick={() => {
                  setConnectingConnectorUid(connectorItem.uid);
                  connect(
                    { connector: connectorItem, chainId: BAZA_CHAIN.id },
                    { onSettled: () => setConnectingConnectorUid(null) },
                  );
                }}
                className={`w-full px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed sm:text-sm ${theme.connectButtonClass}`}
              >
                {isThisPending
                  ? "Connecting…"
                  : `Connect with ${connectorLabel(connectorItem.id, connectorItem.name, effectiveAppHost)}`}
              </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`flex min-h-screen items-start justify-center px-3 py-3 text-slate-100 sm:items-center sm:py-4 ${theme.pageClass}`}
      style={theme.pageStyle}
    >
      <WrongNetworkPrompt
        key={isCorrectNetwork ? "network-ok" : "network-wrong"}
        open={Boolean(address && !isCorrectNetwork)}
        isSwitching={isSwitchingChain}
        onSwitch={() => switchChain({ chainId: BAZA_CHAIN.id })}
      />

      <div className={`w-full max-w-md px-4 py-4 sm:max-w-lg sm:px-5 sm:py-5 ${theme.cardClass}`}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-300">
          <span>{shortenAddress(address)}</span>
          <div className="flex flex-wrap items-center gap-2">
            {supportsAtomicBatch ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[11px] text-emerald-200">
                EIP-5792 batch
              </span>
            ) : null}
            {supportsPaymasterService ? (
              <span className="rounded-full border border-violet-500/40 bg-violet-950/40 px-2 py-0.5 text-[11px] text-violet-200">
                Paymaster
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isDisconnectPending}
              className={`px-2 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.disconnectClass}`}
            >
              {isDisconnectPending ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleDailyCheckIn}
              disabled={
                isCheckInPending || !isCorrectNetwork || !canDailyCheckIn
              }
              title="Daily Check-in"
              className={`min-w-0 px-2 py-2 text-[11px] font-medium transition disabled:cursor-not-allowed sm:px-3 sm:text-xs ${theme.checkInClass}`}
            >
              {isCheckInPending ? "Pending…" : "Check-in"}
            </button>

            <ClaimTokensButton
              amount={BigInt(unclaimedBz)}
              disabled={!canClaim}
              supportsAtomicBatch={supportsAtomicBatch}
              highlight={unclaimedBz >= requiredTapsForClaim}
              theme={theme}
              compact
              onConfirmed={() => resetClicks()}
            />
          </div>

          {!canDailyCheckIn && isCorrectNetwork && lastCheckInSec > BigInt(0) ? (
            <p className="mt-1.5 text-center text-[10px] text-slate-400 sm:text-xs">
              Next check-in in{" "}
              <span className="font-mono text-slate-200">
                {formatCountdownSeconds(cooldownRemaining)}
              </span>
            </p>
          ) : null}
        </div>

        {streakBrokenUi ? (
          <div
            className="mb-2 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-center text-xs text-amber-100"
            role="status"
          >
            Your streak reset — start a new cycle!
          </div>
        ) : null}

        <div
          className={`mb-2 flex flex-nowrap items-center justify-between gap-2 px-2.5 py-1.5 text-xs sm:text-sm ${theme.statsClass}`}
        >
          <p className="shrink-0 whitespace-nowrap">🔥 Streak: {streakLabel}</p>
          <p
            className="min-w-0 truncate text-right font-mono whitespace-nowrap"
            title={`${balanceExact} $BAZA`}
          >
            <span className="text-slate-400">💰 Total $BAZA </span>
            <span className="text-slate-100">{balanceCompact}</span>
          </p>
        </div>

        <StreakVisual currentStreak={streakBig} />

        <p className={`mb-1.5 text-center text-sm font-semibold sm:text-base ${theme.accentTextClass}`}>
          Unclaimed $BAZA: {unclaimedBz}
        </p>

        <motion.div className="mb-2.5">
          <motion.div className="mb-1 flex justify-between text-[10px] text-slate-400 sm:text-xs">
            <span>Taps to claim</span>
            <span>
              {tapsTowardClaim}/{requiredTapsForClaim}
            </span>
          </motion.div>
          <motion.div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
            <motion.div
              className={`h-full ${theme.progressClass}`}
              animate={{ width: `${claimTapProgressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        </motion.div>

        <div className="relative mb-3 flex min-h-[11rem] justify-center py-1">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(24rem,100vw)] w-[min(28rem,92vw)] opacity-[0.05] select-none"
            style={{
              transform: "translate(-50%, -50%) rotate(-18deg)",
              backgroundImage: BAZA_WATERMARK_DATA_URI,
              backgroundSize: "104px 72px",
              backgroundRepeat: "repeat",
            }}
            aria-hidden
          />
          <motion.button
            type="button"
            onClick={registerClick}
            disabled={!coinInteractive}
            onPointerEnter={() => coinInteractive && setCoinHover(true)}
            onPointerLeave={() => {
              setCoinHover(false);
              setCoinPressedLocal(false);
            }}
            onPointerDown={() =>
              coinInteractive && setCoinPressedLocal(true)
            }
            onPointerUp={() => setCoinPressedLocal(false)}
            onPointerCancel={() => setCoinPressedLocal(false)}
            whileHover={coinInteractive ? { scale: 1.02 } : undefined}
            whileTap={coinInteractive ? { scale: 0.96 } : undefined}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className={`relative z-10 h-40 w-40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 sm:h-44 sm:w-44 ${theme.mineOuterClass}`}
            style={{ boxShadow: mineShadow }}
            aria-label="Tap to mine BAZA"
          >
            <motion.div
              className={`absolute ${mineInnerInset} flex items-center justify-center ${theme.mineInnerClass}`}
              style={theme.mineInnerStyle}
              animate={{
                scale: coinPressedLocal && coinInteractive ? 0.96 : 1,
              }}
              transition={{ type: "spring", stiffness: 520, damping: 32 }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 42%, rgba(0,0,0,0.12) 100%)",
                }}
                aria-hidden
              />
              <span
                className={`relative select-none text-xl font-black tracking-[0.08em] sm:text-2xl sm:tracking-[0.1em] ${
                  theme.id === "neon" ? "text-black" : "text-white"
                }`}
                style={{
                  textShadow: [
                    "0 1px 0 rgba(255,255,255,0.25)",
                    "0 2px 8px rgba(0,0,0,0.35)",
                  ].join(", "),
                }}
              >
                BAZA
              </span>
            </motion.div>

            <AnimatePresence>
              {particles.map((particle) => (
                <motion.span
                  key={particle.id}
                  initial={{
                    opacity: 1,
                    x: particle.x - 12,
                    y: particle.y - 12,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 0,
                    x: particle.x + particle.dx,
                    y: particle.y + particle.dy,
                    scale: 1.15,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="pointer-events-none absolute z-[3] text-lg font-bold text-blue-100"
                >
                  +1
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="mb-2.5">
          <div className="mb-1 flex justify-between text-[10px] text-slate-400 sm:text-xs">
            <span>Energy</span>
            <span>
              {energy}/{maxEnergy}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
            <motion.div
              className={`h-full ${theme.energyClass}`}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-500">+2 energy per second</p>
        </div>

        <ThemePicker themeId={themeId} themes={themes} onChange={setThemeId} />

        <ShareBonusButtons
          key={address}
          address={address}
          streak={streakBig}
          theme={theme}
          onBonusGranted={(_platform, taps) => addBonusTaps(taps)}
        />
      </div>
    </main>
  );
}
