import { useState, useCallback, useMemo } from 'react';
import { themes, ThemeName, ThemeConfig } from '../themes';

export const useTheme = (initialTheme: ThemeName = 'federation') => {
    const [themeName, setThemeName] = useState<ThemeName>(initialTheme);

    const setTheme = useCallback((name: ThemeName) => {
        setThemeName(name);
    }, []);

    const theme: ThemeConfig = useMemo(() => themes[themeName], [themeName]);

    return { theme, themeName, setTheme };
};

export type { ThemeName };
