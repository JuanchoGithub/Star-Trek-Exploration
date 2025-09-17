import React from 'react';
import { ThemeName } from '../hooks/useTheme';
import { FederationIcon, KlingonIcon, RomulanIcon } from '../assets/ui/icons';

interface ThemeSwitcherProps {
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ themeName, setTheme }) => {
    const themes: { name: ThemeName, label: string, icon: React.ReactNode }[] = [
        { name: 'federation', label: 'Federation', icon: <FederationIcon className="w-5 h-5" /> },
        { name: 'klingon', label: 'Klingon', icon: <KlingonIcon className="w-5 h-5" /> },
        { name: 'romulan', label: 'Romulan', icon: <RomulanIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex items-center gap-2">
            {themes.map(t => (
                <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    title={t.label}
                    className={`p-2 rounded-full transition-colors ${
                        themeName === t.name
                            ? 'bg-accent-yellow text-secondary-text'
                            : 'bg-bg-paper hover:bg-bg-paper-lighter text-text-primary'
                    }`}
                >
                    {t.icon}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;