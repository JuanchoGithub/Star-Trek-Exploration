export const themes = {
    federation: { name: 'Federation', className: 'theme-federation', font: 'font-sans' },
    klingon: { name: 'Klingon', className: 'theme-klingon', font: 'font-serif' },
    romulan: { name: 'Romulan', className: 'theme-romulan', font: 'font-mono' },
};

export type ThemeName = keyof typeof themes;
export type ThemeConfig = typeof themes[ThemeName];
