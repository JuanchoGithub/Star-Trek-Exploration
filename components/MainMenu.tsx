import React, { useState } from 'react';
import StarfieldBackground from './StarfieldBackground';
import { ThemeName } from '../hooks/useTheme';
import ThemeSwitcher from './ThemeSwitcher';

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
    const [isExpanded, setIsExpanded] = useState(false);

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
                    {isExpanded ? (
                         <div className="space-y-3">
                            <button onClick={onLoadGame} disabled={!hasSaveGame} className="w-full btn btn-primary text-lg">Load Mission</button>
                            <button onClick={onImportSave} className="w-full btn btn-accent green text-lg text-white">Import Save</button>
                            <button onClick={onOpenChangelog} className="w-full btn btn-secondary text-lg">Latest Changes</button>
                            <button onClick={onOpenManual} className="w-full btn btn-secondary text-lg">Player's Manual</button>
                            <button onClick={() => setIsExpanded(false)} className="w-full btn btn-tertiary text-lg">Back</button>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <button onClick={onNewGame} className="btn btn-primary text-lg">
                                New Mission
                            </button>
                             <button onClick={onStartSimulator} className="btn btn-accent green text-lg text-white">
                                Scenario Simulator
                            </button>
                            <button onClick={() => setIsExpanded(true)} className="btn btn-secondary text-lg">
                                Load / Data / Manual
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MainMenu;