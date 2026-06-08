"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_UI_THEME_ID,
  UI_THEMES,
  UI_THEME_LIST,
  type UiTheme,
  type UiThemeId,
} from "@/config/uiThemes";

const STORAGE_KEY = "baza-ui-theme";

function isUiThemeId(value: string): value is UiThemeId {
  return value in UI_THEMES;
}

export function useUiTheme() {
  const [themeId, setThemeIdState] = useState<UiThemeId>(DEFAULT_UI_THEME_ID);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isUiThemeId(stored)) {
      setThemeIdState(stored);
    }
  }, []);

  const setThemeId = useCallback((id: UiThemeId) => {
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const theme: UiTheme = UI_THEMES[themeId];

  return { theme, themeId, setThemeId, themes: UI_THEME_LIST };
}
