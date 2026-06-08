import type { CSSProperties } from "react";

export type UiThemeId = "classic" | "aurora" | "neon" | "glass";

export type MineShape = "square" | "circle" | "squircle";

export type UiTheme = {
  id: UiThemeId;
  label: string;
  tagline: string;
  swatch: string;
  pageClass: string;
  pageStyle?: CSSProperties;
  cardClass: string;
  statsClass: string;
  accentTextClass: string;
  mutedTextClass: string;
  progressClass: string;
  energyClass: string;
  shareBoxClass: string;
  shareFarcasterClass: string;
  shareTwitterClass: string;
  checkInClass: string;
  claimClass: string;
  claimHighlightClass: string;
  disconnectClass: string;
  connectButtonClass: string;
  mineShape: MineShape;
  mineOuterClass: string;
  mineInnerClass: string;
  mineInnerStyle: CSSProperties;
  mineShadowRest: string;
  mineShadowHover: string;
  mineShadowPressed: string;
};

export const UI_THEMES: Record<UiThemeId, UiTheme> = {
  classic: {
    id: "classic",
    label: "Classic",
    tagline: "Dark slate + Base square",
    swatch: "linear-gradient(135deg, #0f172a 0%, #0052FF 100%)",
    pageClass: "bg-slate-950",
    cardClass:
      "rounded-3xl border border-slate-800 bg-slate-900/80 shadow-[0_0_60px_rgba(59,130,246,0.15)] backdrop-blur",
    statsClass: "rounded-2xl border border-slate-700 bg-slate-900/80",
    accentTextClass: "text-blue-300",
    mutedTextClass: "text-slate-400",
    progressClass: "bg-gradient-to-r from-violet-500 to-blue-400",
    energyClass: "bg-gradient-to-r from-blue-500 to-cyan-400",
    shareBoxClass: "rounded-2xl border border-slate-700/80 bg-slate-950/50",
    shareFarcasterClass:
      "rounded-xl border border-violet-500/40 bg-violet-950/40 text-violet-100 hover:border-violet-400/60 hover:bg-violet-900/50",
    shareTwitterClass:
      "rounded-xl border border-sky-500/40 bg-sky-950/40 text-sky-100 hover:border-sky-400/60 hover:bg-sky-900/50",
    checkInClass:
      "rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-600",
    claimClass: "rounded-xl bg-slate-700 text-white",
    claimHighlightClass:
      "rounded-xl bg-blue-500 text-white shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:bg-blue-400",
    disconnectClass:
      "rounded-lg border border-slate-700 hover:border-slate-500",
    connectButtonClass:
      "rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-600",
    mineShape: "square",
    mineOuterClass: "rounded-2xl bg-[#f4f4f5]",
    mineInnerClass: "rounded-[1.1rem] sm:rounded-[1.25rem]",
    mineInnerStyle: { backgroundColor: "#0052FF" },
    mineShadowRest:
      "0 0 0 1px rgba(255,255,255,0.14), 0 18px 36px rgba(0,0,0,0.42), 0 0 48px rgba(0,82,255,0.28)",
    mineShadowHover:
      "0 0 0 1px rgba(255,255,255,0.2), 0 22px 44px rgba(0,0,0,0.38), 0 0 72px rgba(0,82,255,0.55)",
    mineShadowPressed:
      "0 0 0 1px rgba(255,255,255,0.1), 0 8px 18px rgba(0,0,0,0.5), 0 0 28px rgba(0,82,255,0.2)",
  },

  aurora: {
    id: "aurora",
    label: "Aurora",
    tagline: "Purple-blue aurora glow",
    swatch: "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #0052FF 100%)",
    pageClass: "bg-slate-950",
    pageStyle: {
      background:
        "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(124,58,237,0.35), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 50%, rgba(0,82,255,0.22), transparent 50%), linear-gradient(180deg, #0f172a 0%, #1e1b4b 45%, #020617 100%)",
    },
    cardClass:
      "rounded-[2rem] border border-violet-400/20 bg-slate-950/55 shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-xl",
    statsClass:
      "rounded-2xl border border-violet-500/25 bg-violet-950/20 backdrop-blur",
    accentTextClass: "text-violet-200",
    mutedTextClass: "text-violet-300/70",
    progressClass:
      "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500",
    energyClass: "bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400",
    shareBoxClass:
      "rounded-[1.25rem] border border-violet-400/25 bg-violet-950/20 backdrop-blur",
    shareFarcasterClass:
      "rounded-full border border-fuchsia-400/40 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/30 text-fuchsia-100 hover:from-violet-500/50 hover:to-fuchsia-500/40",
    shareTwitterClass:
      "rounded-full border border-blue-400/40 bg-gradient-to-r from-blue-600/30 to-violet-600/30 text-blue-100 hover:from-blue-500/40 hover:to-violet-500/35",
    checkInClass:
      "rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:from-emerald-400 hover:to-teal-300 disabled:from-slate-600 disabled:to-slate-600",
    claimClass:
      "rounded-full bg-gradient-to-r from-slate-700 to-slate-600 text-white",
    claimHighlightClass:
      "rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 text-white shadow-[0_0_40px_rgba(139,92,246,0.55)] hover:brightness-110",
    disconnectClass:
      "rounded-full border border-violet-400/30 bg-violet-950/30 hover:border-violet-300/50",
    connectButtonClass:
      "rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600",
    mineShape: "circle",
    mineOuterClass:
      "rounded-full bg-gradient-to-br from-violet-300/30 via-white/10 to-blue-300/20 p-[3px]",
    mineInnerClass: "rounded-full",
    mineInnerStyle: {
      background:
        "radial-gradient(circle at 30% 25%, #a78bfa 0%, #7c3aed 28%, #0052FF 62%, #1e3a8a 100%)",
    },
    mineShadowRest:
      "0 0 0 1px rgba(167,139,250,0.25), 0 20px 50px rgba(76,29,149,0.45), 0 0 60px rgba(124,58,237,0.35)",
    mineShadowHover:
      "0 0 0 1px rgba(196,181,253,0.35), 0 24px 56px rgba(76,29,149,0.5), 0 0 90px rgba(139,92,246,0.55)",
    mineShadowPressed:
      "0 0 0 1px rgba(167,139,250,0.2), 0 10px 24px rgba(49,46,129,0.55), 0 0 40px rgba(124,58,237,0.25)",
  },

  neon: {
    id: "neon",
    label: "Neon",
    tagline: "Sharp edges + cyan/magenta glow",
    swatch: "linear-gradient(135deg, #000000 0%, #06b6d4 50%, #d946ef 100%)",
    pageClass: "bg-black",
    pageStyle: {
      background:
        "radial-gradient(circle at 15% 20%, rgba(6,182,212,0.12), transparent 35%), radial-gradient(circle at 85% 75%, rgba(217,70,239,0.12), transparent 35%), #000000",
    },
    cardClass:
      "rounded-lg border border-cyan-500/30 bg-black/85 shadow-[0_0_40px_rgba(6,182,212,0.12)]",
    statsClass: "rounded-md border border-cyan-500/25 bg-black/70",
    accentTextClass: "text-cyan-300",
    mutedTextClass: "text-cyan-200/60",
    progressClass: "bg-gradient-to-r from-cyan-400 to-fuchsia-500",
    energyClass: "bg-gradient-to-r from-cyan-500 to-blue-500",
    shareBoxClass: "rounded-md border border-fuchsia-500/25 bg-black/60",
    shareFarcasterClass:
      "rounded-md border border-fuchsia-500/50 bg-fuchsia-950/30 text-fuchsia-200 hover:bg-fuchsia-900/40 hover:shadow-[0_0_20px_rgba(217,70,239,0.25)]",
    shareTwitterClass:
      "rounded-md border border-cyan-500/50 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-900/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    checkInClass:
      "rounded-md bg-gradient-to-r from-lime-500 to-emerald-400 text-black font-semibold hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400",
    claimClass: "rounded-md bg-slate-800 text-white",
    claimHighlightClass:
      "rounded-md bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black font-semibold shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:brightness-110",
    disconnectClass:
      "rounded-md border border-cyan-500/40 hover:border-cyan-400/70 hover:shadow-[0_0_16px_rgba(6,182,212,0.2)]",
    connectButtonClass:
      "rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold hover:brightness-110 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400",
    mineShape: "square",
    mineOuterClass: "rounded-md bg-black border border-cyan-400/40",
    mineInnerClass: "rounded-sm",
    mineInnerStyle: {
      background:
        "linear-gradient(135deg, #06b6d4 0%, #0052FF 45%, #d946ef 100%)",
    },
    mineShadowRest:
      "0 0 0 1px rgba(6,182,212,0.35), 0 0 30px rgba(6,182,212,0.2), 0 0 50px rgba(217,70,239,0.12)",
    mineShadowHover:
      "0 0 0 1px rgba(6,182,212,0.55), 0 0 45px rgba(6,182,212,0.35), 0 0 70px rgba(217,70,239,0.22)",
    mineShadowPressed:
      "0 0 0 1px rgba(6,182,212,0.25), 0 0 18px rgba(6,182,212,0.15), 0 0 30px rgba(217,70,239,0.1)",
  },

  glass: {
    id: "glass",
    label: "Glass",
    tagline: "Soft glass + pastel mesh",
    swatch: "linear-gradient(135deg, #dbeafe 0%, #c4b5fd 50%, #fbcfe8 100%)",
    pageClass: "bg-slate-950",
    pageStyle: {
      background:
        "radial-gradient(at 0% 0%, rgba(59,130,246,0.35) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(168,85,247,0.28) 0%, transparent 45%), radial-gradient(at 50% 100%, rgba(244,114,182,0.22) 0%, transparent 50%), linear-gradient(160deg, #0c1222 0%, #111827 100%)",
    },
    cardClass:
      "rounded-[2rem] border border-white/15 bg-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl",
    statsClass:
      "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md",
    accentTextClass: "text-sky-200",
    mutedTextClass: "text-slate-300/75",
    progressClass:
      "bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400",
    energyClass: "bg-gradient-to-r from-blue-400 to-teal-300",
    shareBoxClass:
      "rounded-2xl border border-white/12 bg-white/5 backdrop-blur-md",
    shareFarcasterClass:
      "rounded-2xl border border-white/15 bg-white/10 text-violet-100 backdrop-blur hover:bg-white/15",
    shareTwitterClass:
      "rounded-2xl border border-white/15 bg-white/10 text-sky-100 backdrop-blur hover:bg-white/15",
    checkInClass:
      "rounded-2xl bg-gradient-to-r from-teal-400/90 to-emerald-400/90 text-slate-950 hover:from-teal-300 hover:to-emerald-300 disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300",
    claimClass: "rounded-2xl bg-white/15 text-white backdrop-blur",
    claimHighlightClass:
      "rounded-2xl bg-gradient-to-r from-sky-400/90 via-violet-400/90 to-pink-400/90 text-white shadow-[0_0_35px_rgba(125,211,252,0.35)] hover:brightness-110",
    disconnectClass:
      "rounded-2xl border border-white/20 bg-white/5 backdrop-blur hover:bg-white/10",
    connectButtonClass:
      "rounded-2xl bg-gradient-to-r from-blue-500/90 to-violet-500/90 text-white hover:from-blue-400 hover:to-violet-400 disabled:from-slate-600 disabled:to-slate-600",
    mineShape: "squircle",
    mineOuterClass:
      "rounded-[2rem] border border-white/25 bg-white/10 backdrop-blur-md",
    mineInnerClass: "rounded-[1.35rem]",
    mineInnerStyle: {
      background:
        "linear-gradient(145deg, rgba(125,211,252,0.95) 0%, rgba(96,165,250,0.95) 35%, rgba(167,139,250,0.95) 70%, rgba(244,114,182,0.9) 100%)",
    },
    mineShadowRest:
      "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12)",
    mineShadowHover:
      "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2), 0 0 50px rgba(125,211,252,0.2)",
    mineShadowPressed:
      "0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1)",
  },
};

export const UI_THEME_LIST = Object.values(UI_THEMES);

export const DEFAULT_UI_THEME_ID: UiThemeId = "classic";
