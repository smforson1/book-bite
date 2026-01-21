import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { UserTheme, ManagerTheme, DarkColors, LightColors, SPACING, SIZES, FONTS, SHADOWS } from '../theme';
import { useAuthStore } from '../store/useAuthStore';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeType = typeof UserTheme;

interface ThemeContextType {
    colors: ThemeType;
    spacing: typeof SPACING;
    sizes: typeof SIZES;
    fonts: typeof FONTS;
    shadows: typeof SHADOWS;
    isManager: boolean;
    isDark: boolean;
    themeMode: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@book_bite_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const user = useAuthStore((state: any) => state.user);
    const isManager = user?.role === 'MANAGER';
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    // Load saved theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Update isDark when themeMode or systemColorScheme changes
    useEffect(() => {
        if (themeMode === 'system') {
            setIsDark(systemColorScheme === 'dark');
        } else {
            setIsDark(themeMode === 'dark');
        }
    }, [themeMode, systemColorScheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = isDark ? 'light' : 'dark';
        setThemeMode(newMode);
    };

    // Select colors based on dark mode and user role
    let colors: ThemeType;
    if (isDark) {
        colors = DarkColors;
    } else {
        colors = isManager ? ManagerTheme : UserTheme;
    }

    const theme = {
        colors,
        spacing: SPACING,
        sizes: SIZES,
        fonts: FONTS,
        shadows: SHADOWS,
        isManager,
        isDark,
        themeMode,
        toggleTheme,
        setThemeMode,
    };

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
