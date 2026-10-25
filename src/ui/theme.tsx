import React, { createContext, useContext, useMemo, useState } from 'react';

/** Palette shape; light and dark provide the same keys. */
export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  warm: string; // warming service accent
  cool: string; // cooling service accent
  active: string; // emergency-active highlight
}

export const darkColors: Palette = {
  bg: '#0E1A2B',
  surface: '#17263B',
  surfaceAlt: '#1F3250',
  text: '#F2F6FC',
  textMuted: '#9DB0CC',
  accent: '#4EA8DE',
  border: '#2A3C58',
  warm: '#F2994A',
  cool: '#56CCF2',
  active: '#2ECC71',
};

export const lightColors: Palette = {
  bg: '#F3F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#E9EEF6',
  text: '#13202E',
  textMuted: '#55667B',
  accent: '#1E6FA8',
  border: '#D2DBE8',
  warm: '#D9741A',
  cool: '#1E88B5',
  active: '#1FA85C',
};

export const colors: Palette = darkColors;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 8, md: 12, lg: 18 } as const;

export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  mode: controlledMode,
  initialMode = 'dark',
  onModeChange,
}: {
  children: React.ReactNode;
  mode?: ThemeMode;
  initialMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState<ThemeMode>(initialMode);
  const mode = controlledMode ?? uncontrolled;
  const setMode = (m: ThemeMode) => {
    if (controlledMode === undefined) setUncontrolled(m);
    onModeChange?.(m);
  };
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'light' ? lightColors : darkColors,
      setMode,
      toggle: () => setMode(mode === 'light' ? 'dark' : 'light'),
    }),
    [mode], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      mode: 'dark',
      colors: darkColors,
      setMode: () => {},
      toggle: () => {},
    }
  );
}
