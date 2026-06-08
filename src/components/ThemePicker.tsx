"use client";

import type { UiTheme, UiThemeId } from "@/config/uiThemes";

type ThemePickerProps = {
  themeId: UiThemeId;
  themes: UiTheme[];
  onChange: (id: UiThemeId) => void;
};

export function ThemePicker({ themeId, themes, onChange }: ThemePickerProps) {
  return (
    <div className="mb-2 rounded-xl border border-white/10 bg-black/20 p-1.5 backdrop-blur-sm">
      <div className="grid grid-cols-4 gap-1.5">
        {themes.map((item) => {
          const active = item.id === themeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-lg border px-1 py-1.5 text-center transition ${
                active
                  ? "border-blue-400/70 bg-blue-500/10 ring-1 ring-blue-400/40"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
              aria-pressed={active}
            >
              <span
                className="mx-auto mb-1 block h-5 w-full max-w-[2.75rem] rounded-md border border-white/10"
                style={{ background: item.swatch }}
                aria-hidden
              />
              <span className="block text-[10px] font-semibold leading-none text-slate-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
