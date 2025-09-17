import React from 'react';
import { ThemeName } from '../hooks/useTheme';

interface ThemeSwitcherProps {
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ themeName, setTheme }) => {
    const themes: { name: ThemeName, label: string }[] = [
        { name: 'federation', label: 'Federation' },
        { name: 'klingon', label: 'Klingon' },
        { name: 'romulan', label: 'Romulan' },
    ];

    return (
        <div className="flex items-center gap-2">
            {themes.map(t => (
                <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                        themeName === t.name
                            ? 'bg-accent-yellow text-secondary-text'
                            : 'bg-bg-paper hover:bg-bg-paper-lighter text-text-primary'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
