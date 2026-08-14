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
  background: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f4f4f5',
  border: '#e4e4e7',
  primary: '#17c06e',
  primaryForeground: '#fafafa',
  primaryMuted: '#e8f8f0',
  text: '#18181b',
  textMuted: '#71717a',
  textSubtle: '#a1a1aa',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#2563eb',
  overlay: 'rgba(24, 24, 27, 0.55)',
};

export const darkColors: ThemeColors = {
  background: '#0a0a0a',
  surface: '#171717',
  surfaceAlt: '#262626',
  border: '#ffffff1a',
  primary: '#10b981',
  primaryForeground: '#ffffff',
  primaryMuted: '#10b98114',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
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

/* Web (Tailwind) radius scale: rounded-sm 0.3rem≈5, rounded-md 0.4rem≈6, rounded-lg 0.6rem≈10, rounded-xl 0.8rem≈13, rounded-2xl 1rem≈16, full */
export const radius = {
  sm: 5,
  md: 6,
  lg: 10,
  xl: 13,
  xxl: 16,
  full: 999,
} as const;

export const typography = {
  xs: 10,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 32,
} as const;

export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extrabold: 'Outfit_800ExtraBold',
  black: 'Outfit_900Black',
  light: 'Outfit_300Light',
} as const;

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fonts: typeof fonts;
  isDark: boolean;
}

const ThemeContext = createContext<Theme>({
  mode: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
  fonts,
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
    fonts,
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
