import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Light Theme ─────────────────────────────────────────────────────────────
export const lightTheme = {
  isDark: false,

  // Canvas
  background: '#F7F7F8',
  backgroundSecondary: '#F4F4F5',

  // Cards
  surface: '#FFFFFF',
  surfaceBorder: '#E4E4E7',
  surfaceElevated: '#FFFFFF',
  surfaceElevatedBorder: '#E4E4E7',
  hairline: '#E4E4E7',
  hairlineFaint: '#F4F4F5',
  track: '#F4F4F5',

  // Typography
  textPrimary: '#0A0A0A',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  textSubtle: '#D4D4D8',
  textInverse: '#FFFFFF',

  // Buttons
  buttonPrimaryBg: '#0A0A0A',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FFFFFF',
  buttonSecondaryBorder: '#E4E4E7',
  buttonSecondaryText: '#0A0A0A',

  // Icon button (header square buttons)
  iconButtonBg: '#FFFFFF',
  iconButtonBorder: '#E4E4E7',
  iconButtonColor: '#0A0A0A',

  // Cashflow
  emerald: '#059669',
  emeraldBg: '#ECFDF5',
  emeraldBorder: '#A7F3D0',
  crimson: '#E11D48',
  crimsonBg: '#FFF1F2',
  crimsonBorder: '#FECDD3',

  // Bottom Nav (Signature Brand Pink)
  navBg: '#E11D74',
  navBorder: 'rgba(255, 255, 255, 0.20)',
  navActivePill: 'rgba(255, 255, 255, 0.24)',
  navActivePillBorder: 'rgba(255, 255, 255, 0.40)',
  navActiveText: '#FFFFFF',
  navInactiveIcon: 'rgba(255, 255, 255, 0.75)',

  // Input
  inputBg: '#FFFFFF',
  inputBorder: '#E4E4E7',
  inputText: '#0A0A0A',
  inputPlaceholder: '#A1A1AA',

  // Brand Signature Pink
  brandPink: '#E11D74',
  brandPinkBg: '#FDF2F8',
  brandPinkBorder: '#FBCFE8',
  brandPinkText: '#BE185D',
  brandPinkSubtle: '#FFF5F9',

  // Misc
  pillBg: '#F4F4F5',
  pillText: '#71717A',
  statusBar: 'dark-content' as 'dark-content' | 'light-content',
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
export const darkTheme: typeof lightTheme = {
  isDark: true,

  background: '#0A0A0A',
  backgroundSecondary: '#111113',

  surface: '#18181B',
  surfaceBorder: '#27272A',
  surfaceElevated: '#1C1C1F',
  surfaceElevatedBorder: '#3F3F46',
  hairline: '#27272A',
  hairlineFaint: '#18181B',
  track: '#27272A',

  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textSubtle: '#3F3F46',
  textInverse: '#0A0A0A',

  buttonPrimaryBg: '#FAFAFA',
  buttonPrimaryText: '#0A0A0A',
  buttonSecondaryBg: '#18181B',
  buttonSecondaryBorder: '#3F3F46',
  buttonSecondaryText: '#FAFAFA',

  iconButtonBg: '#18181B',
  iconButtonBorder: '#3F3F46',
  iconButtonColor: '#FAFAFA',

  emerald: '#059669',
  emeraldBg: '#052E16',
  emeraldBorder: '#064E3B',
  crimson: '#E11D48',
  crimsonBg: '#1A0C12',
  crimsonBorder: '#4C0519',

  navBg: '#E11D74',
  navBorder: 'rgba(255, 255, 255, 0.20)',
  navActivePill: 'rgba(255, 255, 255, 0.24)',
  navActivePillBorder: 'rgba(255, 255, 255, 0.40)',
  navActiveText: '#FFFFFF',
  navInactiveIcon: 'rgba(255, 255, 255, 0.75)',

  inputBg: '#18181B',
  inputBorder: '#3F3F46',
  inputText: '#FAFAFA',
  inputPlaceholder: '#71717A',

  // Brand Signature Pink
  brandPink: '#FF2E93',
  brandPinkBg: '#240816',
  brandPinkBorder: '#701A45',
  brandPinkText: '#F472B6',
  brandPinkSubtle: '#1C0612',

  pillBg: '#27272A',
  pillText: '#A1A1AA',
  statusBar: 'light-content',
};

export type Theme = typeof lightTheme;

// ─── Context ──────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
