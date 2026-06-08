"use client";

import type { UiTheme, UiThemeId } from "@/config/uiThemes";

type ThemePickerProps = {
  themeId: UiThemeId;
  themes: UiTheme[];
  onChange: (id: UiThemeId) => void;
};

export function ThemePicker({ themeId, themes, onChange }: ThemePickerProps) {
  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Design preview
        </p>
        <p className="text-[11px] text-slate-500">{themes.find((t) => t.id === themeId)?.tagline}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {themes.map((item) => {
          const active = item.id === themeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-xl border p-2 text-left transition ${
                active
                  ? "border-blue-400/70 bg-blue-500/10 ring-1 ring-blue-400/40"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
              aria-pressed={active}
            >
              <span
                className="mb-2 block h-8 w-full rounded-lg border border-white/10"
                style={{ background: item.swatch }}
                aria-hidden
              />
              <span className="block text-[11px] font-semibold text-slate-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
