// FIX: Replaced invalid "--- START OF FILE App.tsx ---" header.
import React, { useState } from 'react';
import StarfieldBackground from './StarfieldBackground';
import { ThemeName } from '../hooks/useTheme';
import ThemeSwitcher from './ThemeSwitcher';
import { BookIcon } from '../assets/ui/icons';

interface MainMenuProps {
    onNewGame: () => void;
    onLoadGame: () => void;
    onStartSimulator: () => void;
    onImportSave: () => void;
    onOpenManual: () => void;
    onOpenChangelog: () => void;
    hasSaveGame: boolean;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGame, onStartSimulator, onImportSave, onOpenManual, onOpenChangelog, hasSaveGame, themeName, setTheme }) => {
    return (
        <main className={`bg-bg-default text-text-primary h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center p-8 theme-${themeName}`}>
            <StarfieldBackground />
            <div className="absolute top-4 right-4">
                <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
            </div>
            <div className="relative z-10 text-center flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-bold text-secondary-light mb-2 tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                    Star Trek
                </h1>
                <h2 className="text-3xl md:text-5xl font-bold text-primary-light mb-12" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                    Vibe Exploration
                </h2>

                <div className="w-full max-w-sm flex flex-col gap-4">
                    <button onClick={onNewGame} className="btn btn-primary text-lg">
                        New Mission
                    </button>
                    <button onClick={onLoadGame} disabled={!hasSaveGame} className="btn btn-primary text-lg">
                        Load Mission
                    </button>
                    <button onClick={onStartSimulator} className="btn btn-accent green text-lg text-white">
                        Scenario Simulator
                    </button>
                    <button onClick={onImportSave} className="btn btn-accent green text-lg text-white">
                        Import Save
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 left-6 z-10">
                <button
                    onClick={onOpenManual}
                    className="btn btn-tertiary text-sm"
                    aria-label="Open Player's Manual"
                    title="Player's Manual"
                >
                   Manual
                </button>
            </div>
            <div className="absolute bottom-6 right-6 z-10">
                 <button onClick={onOpenChangelog} className="btn btn-tertiary text-sm">
                    Changelog
                </button>
            </div>
        </main>
    );
};

export default MainMenu;