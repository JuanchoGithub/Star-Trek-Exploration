import React from 'react';
import StarfieldBackground from './StarfieldBackground';
import { ThemeName } from '../hooks/useTheme';
import ThemeSwitcher from './ThemeSwitcher';
import { StarfleetLogoIcon, KlingonLogoIcon } from '../assets/ui/icons';
import { DderidexWireframe } from '../assets/ships/wireframes';
import LcarsDecoration from './LcarsDecoration';
import RomulanDecoration from './RomulanDecoration';
import { useGameActions } from '../contexts/GameActionsContext';
import { useUIState } from '../contexts/UIStateContext';

interface MenuLayoutProps {
    onNewGame: () => void;
    onLoadGame: () => void;
    onStartSimulator: () => void;
    onImportSave: () => void;
    onOpenManual: () => void;
    onOpenChangelog: () => void;
    hasSaveGame: boolean;
}

const FederationMenu: React.FC<MenuLayoutProps> = (props) => {
    return (
        <div className="relative z-10 w-full h-full federation-main-menu-grid">
            {/* Header */}
            <div style={{ gridColumn: '1 / 3', gridRow: '1 / 2' }} className="h-16 bg-primary-dark rounded-tr-3xl flex items-center pl-8">
                <h1 className="text-3xl font-bold uppercase text-primary-text tracking-widest">Starfleet Mission Operations</h1>
            </div>

            {/* Sidebar with buttons */}
            <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }} className="h-full flex flex-col justify-end items-end gap-2 pr-4 pb-12">
                <button onClick={props.onNewGame} className="btn btn-primary text-lg w-full">New Mission</button>
                <button onClick={props.onLoadGame} disabled={!props.hasSaveGame} className="btn btn-primary text-lg w-full">Load Mission</button>
                <button onClick={props.onStartSimulator} className="btn btn-secondary text-lg w-full">Scenario Simulator</button>
                <button onClick={props.onImportSave} className="btn btn-secondary text-lg w-full">Import Save File</button>
                <button onClick={props.onOpenManual} className="btn btn-tertiary text-sm w-full mt-4">Manual</button>
                <button onClick={props.onOpenChangelog} className="btn btn-tertiary text-sm w-full">Changelog</button>
            </div>

            {/* Main Content Area */}
            <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }} className="h-full relative flex justify-center items-center">
                <StarfleetLogoIcon className="w-96 h-96 text-primary-light federation-logo-animated opacity-75" />
                <LcarsDecoration type="label" label="U.S.S. ENDEAVOUR" className="absolute top-4 left-4 text-xl" seed={11} />
                <LcarsDecoration type="numbers" className="absolute top-12 left-4 text-xl" seed={12} />
                <LcarsDecoration type="label" label="NCC-71805" className="absolute bottom-4 right-4 text-xl" seed={13} />
            </div>

            {/* Footer */}
            <div style={{ gridColumn: '1 / 3', gridRow: '3 / 4' }} className="h-8 bg-primary-main rounded-br-2xl"></div>
        </div>
    );
};

const KlingonMenu: React.FC<MenuLayoutProps> = (props) => {
    return (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-8">
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <KlingonLogoIcon className="w-[80vmin] h-[80vmin] text-primary-dark klingon-logo-animated"/>
            </div>
            
            <div className="relative flex flex-col items-center">
                <h1 className="text-8xl font-bold text-secondary-light klingon-title mb-4">Qapla'</h1>
                <h2 className="text-3xl text-text-primary uppercase tracking-[0.4em]" style={{ textShadow: '2px 2px 8px black' }}>Vibe Exploration</h2>
            </div>
            
            <div className="absolute bottom-16 w-full max-w-xl flex flex-col items-center gap-4">
                <div className="flex w-full justify-center gap-8">
                    <button onClick={props.onNewGame} className="btn btn-primary text-lg klingon-btn-swap flex-1 max-w-xs">
                        <span className="klingon-text">yI'el</span>
                        <span className="english-text">New Mission</span>
                    </button>
                    <button onClick={props.onLoadGame} disabled={!props.hasSaveGame} className="btn btn-primary text-lg klingon-btn-swap flex-1 max-w-xs">
                        <span className="klingon-text">yIchu'</span>
                        <span className="english-text">Load Mission</span>
                    </button>
                </div>
                <div className="flex w-full justify-center gap-8">
                    <button onClick={props.onStartSimulator} className="btn btn-accent red text-lg klingon-btn-swap flex-1 max-w-xs">
                        <span className="klingon-text">QI'lop</span>
                        <span className="english-text">Simulator</span>
                    </button>
                    <button onClick={props.onImportSave} className="btn btn-accent red text-lg klingon-btn-swap flex-1 max-w-xs">
                        <span className="klingon-text">yI'bogh</span>
                        <span className="english-text">Import Save</span>
                    </button>
                </div>
                <div className="flex w-full justify-center gap-8 mt-4">
                    <button onClick={props.onOpenManual} className="btn btn-tertiary text-sm klingon-btn-swap">
                        <span className="klingon-text">pa'</span>
                        <span className="english-text">Manual</span>
                    </button>
                    <button onClick={props.onOpenChangelog} className="btn btn-tertiary text-sm klingon-btn-swap">
                        <span className="klingon-text">ghItlh</span>
                        <span className="english-text">Changelog</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const WireframeWarbird = () => (
    <div className="romulan-warbird-bg">
        <DderidexWireframe />
    </div>
);

const RomulanMenu: React.FC<MenuLayoutProps> = (props) => {
    return (
        <div className="relative w-full h-full romulan-main-menu-wrapper">
            <WireframeWarbird />
            <RomulanDecoration />
            <div className="romulan-main-menu-grid p-8">
                <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }} className="text-center pt-8">
                    <h1 className="text-5xl font-bold text-primary-main uppercase">TAL SHIAR</h1>
                    <h2 className="text-2xl text-text-secondary tracking-[0.3em]">COVERT INTERFACE</h2>
                </div>
                
                {/* Central column with buttons */}
                <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }} className="flex flex-col justify-center items-center gap-4 p-8">
                    <button onClick={props.onNewGame} className="btn w-full max-w-sm text-lg">Initiate Operation</button>
                    <button onClick={props.onLoadGame} disabled={!props.hasSaveGame} className="btn w-full max-w-sm text-lg">Resume Operation</button>
                    <button onClick={props.onStartSimulator} className="btn w-full max-w-sm text-lg">War Games Simulation</button>
                    <button onClick={props.onImportSave} className="btn w-full max-w-sm text-lg">Insert Datacrystal</button>
                </div>
                
                {/* Left decorative column */}
                <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }} className="flex flex-col justify-between p-4 font-mono text-xs text-dark-green uppercase">
                    <div>
                        <p>Status: Nominal</p>
                        <p>Encryption: T-5</p>
                    </div>
                    <div>
                        <p>Node: 7-ALPHA</p>
                        <p>Signal: Secure</p>
                    </div>
                </div>
                
                {/* Right decorative column */}
                <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3' }} className="flex flex-col justify-between items-end p-4 font-mono text-xs text-dark-green uppercase">
                    <div>
                        <p>ID: T'LARA</p>
                        <p>Auth: Granted</p>
                    </div>
                    <div>
                        <p>Protocol: Shadow</p>
                        <p>Directive: A-1</p>
                    </div>
                </div>

                <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }} className="flex items-end pl-8 pb-8">
                    <button onClick={props.onOpenManual} className="btn text-sm">Tactical Briefing</button>
                </div>

                <div style={{ gridColumn: '3 / 4', gridRow: '3 / 4' }} className="flex items-end justify-end pr-8 pb-8">
                    <button onClick={props.onOpenChangelog} className="btn text-sm">Revision History</button>
                </div>
            </div>
        </div>
    );
};

const MainMenu: React.FC = () => {
    const { handleNewGame, handleLoadGame, handleStartSimulator, handleImportClick } = useGameActions();
    const { hasSaveGame, themeName, setTheme, setShowPlayerManual, setShowChangelog } = useUIState();

    const propsForMenu = { 
        onNewGame: handleNewGame, 
        onLoadGame: handleLoadGame, 
        onStartSimulator: handleStartSimulator, 
        onImportSave: handleImportClick, 
        onOpenManual: () => setShowPlayerManual(true),
        onOpenChangelog: () => setShowChangelog(true),
        hasSaveGame 
    };

    const renderMenu = () => {
        switch (themeName) {
            case 'federation':
                return <FederationMenu {...propsForMenu} />;
            case 'klingon':
                return <KlingonMenu {...propsForMenu} />;
            case 'romulan':
                return <RomulanMenu {...propsForMenu} />;
            default:
                return <FederationMenu {...propsForMenu} />; // Fallback
        }
    };
    
    return (
        <main className={`bg-bg-default text-text-primary h-screen w-screen overflow-hidden relative theme-${themeName}`}>
            <div className="main-menu-bg"></div> {/* For CSS-based backgrounds */}
            {themeName === 'federation' && <StarfieldBackground />}
            <div className="absolute top-4 right-4 z-20">
                <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
            </div>
            
            {renderMenu()}
        </main>
    );
};

export default MainMenu;
