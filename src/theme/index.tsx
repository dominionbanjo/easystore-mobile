import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  primaryForeground: string;
  primaryMuted: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#f8faf9',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f3',
  border: '#e2e8e6',
  primary: '#17c06e',
  primaryForeground: '#ffffff',
  primaryMuted: '#e6f7ee',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#94a3b8',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#2563eb',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const darkColors: ThemeColors = {
  background: '#0b0f0e',
  surface: '#131a17',
  surfaceAlt: '#1c2521',
  border: '#26312c',
  primary: '#17c06e',
  primaryForeground: '#04150c',
  primaryMuted: '#123523',
  text: '#e6ede9',
  textMuted: '#9fb0a7',
  textSubtle: '#5d6f66',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 32,
} as const;

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  isDark: boolean;
}

const ThemeContext = createContext<Theme>({
  mode: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeMode();
  const value: Theme = {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    isDark: mode === 'dark',
  };
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): Theme {
  return useContext(ThemeContext);
}

export function useThemeMode(): ThemeMode {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}
