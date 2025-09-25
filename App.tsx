// FIX: Removed invalid "--- START OF FILE App.tsx ---" header.
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import PlayerHUD from './components/PlayerHUD';
import LogPanel from './components/LogPanel';
import SectorView from './components/SectorView';
import QuadrantView from './components/QuadrantView';
import AwayMissionDialog from './components/AwayMissionDialog';
import HailDialog from './components/HailDialog';
import StatusLine from './components/StatusLine';
import ShipStatus from './components/ShipStatus';
import EventDialog from './components/EventDialog';
import WarpAnimation from './components/WarpAnimation';
import CombatFXLayer from './components/CombatFXLayer';
import AwayMissionResultDialog from './components/AwayMissionResultDialog';
import { useTheme, ThemeName } from './hooks/useTheme';
import ThemeSwitcher from './components/ThemeSwitcher';
import PlayerManual from './components/PlayerManual';
import EventResultDialog from './components/EventResultDialog';
import LcarsDecoration from './components/LcarsDecoration';
import RomulanDecoration from './components/RomulanDecoration';
import MainMenu from './components/MainMenu';
import ScenarioSimulator from './components/ScenarioSimulator';
import { SAVE_GAME_KEY } from './assets/configs/gameConstants';
import { ScienceIcon } from './assets/ui/icons';
import BattleReplayer from './components/BattleReplayer';
import Changelog from './components/Changelog';
import { GameState, ShipSubsystems } from './types';
import Resizer from './components/Resizer';

interface GameMenuProps {
    onSaveGame: () => void;
    onLoadGame: () => void;
    onExportSave: () => void;
    onImportSave: () => void; // Prop is now a trigger function
    onOpenManual: () => void;
    onClose: () => void;
    onExitToMainMenu: () => void;
    onOpenReplayer: () => void;
    hasReplay: boolean;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSaveGame, onLoadGame, onExportSave, onImportSave, onOpenManual, onClose, onExitToMainMenu, onOpenReplayer, hasReplay }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="panel-style p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-secondary-light mb-4 text-center">Game Menu</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onSaveGame} className="w-full btn btn-primary">Save</button>
                        <button onClick={onLoadGame} className="w-full btn btn-primary">Load</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onImportSave} className="w-full btn btn-accent green text-white">Import</button>
                        <button onClick={onExportSave} className="w-full btn btn-accent green text-white">Export</button>
                    </div>
                    <button onClick={onOpenManual} className="w-full btn btn-secondary">Player's Manual</button>
                    <button onClick={onOpenReplayer} disabled={!hasReplay} className="w-full btn btn-secondary">Battle Replayer</button>
                    <button onClick={onExitToMainMenu} className="w-full btn btn-tertiary">Exit to Main Menu</button>
                    <button onClick={onClose} className="w-full btn btn-tertiary">Close Menu</button>
                </div>
            </div>
        </div>
    );
};

// FIX: Moved SidebarContent outside of the App component to prevent re-mounting on every render.
interface SidebarContentProps {
    gameState: GameState;
    onEnergyChange: (changedKey: 'weapons' | 'shields' | 'engines', value: number) => void;
    onToggleRedAlert: () => void;
    onEvasiveManeuvers: () => void;
    onSelectRepairTarget: (subsystem: 'hull' | keyof ShipSubsystems | null) => void;
    onToggleCloak: () => void;
    onTogglePointDefense: () => void;
    themeName: ThemeName;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
    gameState, onEnergyChange, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget, onToggleCloak, onTogglePointDefense, themeName 
}) => (
    <ShipStatus 
        gameState={gameState} 
        onEnergyChange={onEnergyChange}
        onToggleRedAlert={onToggleRedAlert}
        onEvasiveManeuvers={onEvasiveManeuvers}
        onSelectRepairTarget={onSelectRepairTarget as any}
        onToggleCloak={onToggleCloak}
        onTogglePointDefense={onTogglePointDefense}
        themeName={themeName}
    />
);

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;
const MIN_HUD_HEIGHT = 240;
const MAX_HUD_HEIGHT = 500;

const App: React.FC = () => {
    const [view, setView] = useState<'main-menu' | 'game' | 'simulator'>('main-menu');
    const { 
        gameState, selectedTargetId, navigationTarget, currentView,
        activeAwayMission, activeHail, targetEntity, playerTurnActions, activeEvent,
        isWarping, isTurnResolving, awayMissionResult, eventResult, desperationMoveAnimation,
        onEnergyChange, onEndTurn, onFirePhasers, onLaunchTorpedo, onEvasiveManeuvers, 
        onSelectTarget, onSetNavigationTarget, onSetView, onWarp, onDockWithStarbase, 
        onSelectRepairTarget, onScanTarget, onInitiateRetreat, onCancelRetreat, onStartAwayMission, 
        onChooseAwayMissionOption, onHailTarget, onCloseHail, onSelectSubsystem, 
        onChooseEventOption, saveGame, loadGame, exportSave, importSave, onDistributeEvenly, 
        onSendAwayTeam, onToggleRedAlert, onCloseAwayMissionResult, onCloseEventResult, 
        onScanQuadrant, onEnterOrbit, onToggleCloak, onTogglePointDefense, newGame, onUndock
    } = useGameLogic();

    const [showGameMenu, setShowGameMenu] = useState(false);
    const [showPlayerManual, setShowPlayerManual] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showReplayer, setShowReplayer] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const { theme, themeName, setTheme } = useTheme('federation');
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem('sidebarWidth');
        return saved ? Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, parseInt(saved, 10))) : 320;
    });
    const [bottomPanelHeight, setBottomPanelHeight] = useState(() => {
        const saved = localStorage.getItem('bottomPanelHeight');
        return saved ? Math.max(MIN_HUD_HEIGHT, Math.min(MAX_HUD_HEIGHT, parseInt(saved, 10))) : 288;
    });
    
    useEffect(() => localStorage.setItem('sidebarWidth', String(sidebarWidth)), [sidebarWidth]);
    useEffect(() => localStorage.setItem('bottomPanelHeight', String(bottomPanelHeight)), [bottomPanelHeight]);

    const handleVerticalResize = useCallback((movementX: number) => {
        setSidebarWidth(prev => Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, prev - movementX)));
    }, []);

    const handleHorizontalResize = useCallback((movementY: number) => {
        setBottomPanelHeight(prev => Math.max(MIN_HUD_HEIGHT, Math.min(MAX_HUD_HEIGHT, prev - movementY)));
    }, []);


    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewGame = useCallback(() => {
        localStorage.removeItem(SAVE_GAME_KEY);
        newGame();
        setView('game');
    }, [newGame]);

    const handleLoadGame = useCallback(() => {
        loadGame();
        setView('game');
    }, [loadGame]);

    const handleImportSaveFromFile = useCallback((jsonString: string) => {
        importSave(jsonString);
        setView('game');
        setShowGameMenu(false);
    }, [importSave]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                handleImportSaveFromFile(text);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleStartSimulator = useCallback(() => {
        setView('simulator');
    }, []);

    const handleExitToMainMenu = useCallback(() => {
        setView('main-menu');
    }, []);

    useEffect(() => {
        document.body.className = `theme-${themeName}`;
        return () => { document.body.className = ''; }
    }, [themeName]);

    if (view === 'main-menu') {
        return (
            <>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                <MainMenu
                    onNewGame={handleNewGame}
                    onLoadGame={handleLoadGame}
                    onStartSimulator={handleStartSimulator}
                    onImportSave={handleImportClick}
                    onOpenManual={() => setShowPlayerManual(true)}
                    onOpenChangelog={() => setShowChangelog(true)}
                    hasSaveGame={!!localStorage.getItem(SAVE_GAME_KEY)}
                    themeName={themeName}
                    setTheme={setTheme}
                />
                {showPlayerManual && <PlayerManual onClose={() => setShowPlayerManual(false)} themeName={themeName} />}
                {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
            </>
        );
    }
    
    if (view === 'simulator') {
        return <ScenarioSimulator onExit={handleExitToMainMenu} />;
    }

    const { player, logs, currentSector: sector, redAlert, quadrantMap, isDocked } = gameState;

    return (
        <div className={`h-screen w-screen bg-bg-default text-text-primary overflow-hidden relative ${theme.font} ${redAlert ? 'red-alert-pulse' : ''} theme-${themeName}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            {themeName === 'romulan' && <RomulanDecoration />}
            {showPlayerManual && <PlayerManual onClose={() => setShowPlayerManual(false)} themeName={themeName} />}
            {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}
            {showReplayer && <BattleReplayer history={gameState.replayHistory || []} onClose={() => setShowReplayer(false)} themeName={themeName} />}
            {showLogModal && <LogPanel logs={logs} onClose={() => setShowLogModal(false)} />}
            {activeAwayMission && <AwayMissionDialog mission={activeAwayMission} onChoose={onChooseAwayMissionOption} themeName={themeName} />}
            {awayMissionResult && <AwayMissionResultDialog result={awayMissionResult} onClose={onCloseAwayMissionResult} />}
            {activeHail && targetEntity && <HailDialog hailData={activeHail} target={targetEntity} onClose={onCloseHail} />}
            {activeEvent && <EventDialog event={activeEvent.template} onChoose={onChooseEventOption} />}
            {eventResult && <EventResultDialog result={eventResult} onClose={onCloseEventResult} />}
            {showGameMenu && (
                <GameMenu
                    onSaveGame={saveGame}
                    onLoadGame={handleLoadGame}
                    onExportSave={exportSave}
                    onImportSave={handleImportClick}
                    onOpenManual={() => { setShowPlayerManual(true); setShowGameMenu(false); }}
                    onClose={() => setShowGameMenu(false)}
                    onExitToMainMenu={handleExitToMainMenu}
                    onOpenReplayer={() => { setShowReplayer(true); setShowGameMenu(false); }}
                    hasReplay={!!gameState.replayHistory && gameState.replayHistory.length > 0}
                />
            )}

            <div className="h-full w-full flex flex-col p-2 md:p-4 gap-2 md:gap-0 relative z-10">
                <main className="flex-grow min-h-0">
                    <div className="h-full flex flex-col md:flex-row">
                        {/* Main Content Area */}
                        <div className="flex-grow flex flex-col min-w-0 min-h-0">
                            {/* Top Panel (Map) */}
                            <div className="flex-grow min-h-0">
                                <section className="flex flex-row gap-2 h-full">
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => onSetView('sector')}
                                            className={`flex-grow w-12 flex items-center justify-center p-1 rounded-md font-bold transition-colors ${
                                                currentView === 'sector'
                                                    ? 'bg-primary-main text-primary-text'
                                                    : 'bg-secondary-main text-secondary-text hover:bg-secondary-light'
                                            }`}
                                        >
                                            <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">Sector View</span>
                                        </button>
                                        <button
                                            onClick={() => onSetView('quadrant')}
                                            className={`flex-grow w-12 flex items-center justify-center p-1 rounded-md font-bold transition-colors ${
                                                currentView === 'quadrant'
                                                    ? 'bg-primary-main text-primary-text'
                                                    : 'bg-secondary-main text-secondary-text hover:bg-secondary-light'
                                            }`}
                                        >
                                            <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">Quadrant Map</span>
                                        </button>
                                    </div>
                                    <div className="relative flex-grow flex justify-center items-center min-h-0">
                                        {isWarping && <WarpAnimation />}
                                        <div className="w-full h-full aspect-[11/10] relative">
                                            {currentView === 'sector' ? (
                                                <>
                                                    <CombatFXLayer effects={gameState.combatEffects} entities={[player.ship, ...sector.entities]} />
                                                    <SectorView 
                                                        entities={sector.entities} 
                                                        playerShip={player.ship}
                                                        selectedTargetId={selectedTargetId}
                                                        onSelectTarget={onSelectTarget}
                                                        navigationTarget={navigationTarget}
                                                        onSetNavigationTarget={onSetNavigationTarget}
                                                        sector={sector}
                                                        themeName={themeName}
                                                        isResizing={isResizing}
                                                    />
                                                </>
                                            ) : (
                                                <QuadrantView
                                                    quadrantMap={quadrantMap}
                                                    playerPosition={player.position}
                                                    onWarp={onWarp}
                                                    onScanQuadrant={onScanQuadrant}
                                                    isInCombat={redAlert}
                                                    themeName={themeName}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                             {/* Horizontal Resizer - only on desktop */}
                            <div className="hidden md:block py-2">
                                <Resizer
                                    onDrag={handleHorizontalResize}
                                    orientation="horizontal"
                                    onResizeStart={() => setIsResizing(true)}
                                    onResizeEnd={() => setIsResizing(false)}
                                />
                            </div>

                             {/* Bottom Panel (HUD) */}
                            <div className="flex-shrink-0" style={!isTouchDevice ? { height: `${bottomPanelHeight}px` } : {}}>
                                <section className="h-full">
                                    <PlayerHUD
                                        gameState={gameState} onEndTurn={onEndTurn} onFirePhasers={onFirePhasers} onLaunchTorpedo={onLaunchTorpedo}
                                        target={targetEntity} isDocked={isDocked} onDockWithStarbase={onDockWithStarbase} onUndock={onUndock}
                                        onScanTarget={onScanTarget}
                                        onInitiateRetreat={onInitiateRetreat} onCancelRetreat={onCancelRetreat} onStartAwayMission={onStartAwayMission}
                                        onHailTarget={onHailTarget} playerTurnActions={playerTurnActions} navigationTarget={navigationTarget}
                                        isTurnResolving={isTurnResolving} onSendAwayTeam={onSendAwayTeam} themeName={themeName}
                                        desperationMoveAnimation={desperationMoveAnimation}
                                        selectedSubsystem={player.targeting?.subsystem || null}
                                        onSelectSubsystem={onSelectSubsystem}
                                        onEnterOrbit={onEnterOrbit}
                                        orbitingPlanetId={gameState.orbitingPlanetId}
                                        onToggleCloak={onToggleCloak}
                                    />
                                </section>
                            </div>
                        </div>
                        
                        {/* Vertical Resizer - only on desktop */}
                        <div className="hidden md:block px-2">
                            <Resizer
                                onDrag={handleVerticalResize}
                                orientation="vertical"
                                onResizeStart={() => setIsResizing(true)}
                                onResizeEnd={() => setIsResizing(false)}
                            />
                        </div>
                        
                        {/* Sidebar */}
                        <aside className="hidden md:flex flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
                           <SidebarContent 
                                gameState={gameState}
                                onEnergyChange={onEnergyChange}
                                onToggleRedAlert={onToggleRedAlert}
                                onEvasiveManeuvers={onEvasiveManeuvers}
                                onSelectRepairTarget={onSelectRepairTarget}
                                onToggleCloak={onToggleCloak}
                                onTogglePointDefense={onTogglePointDefense}
                                themeName={themeName}
                           />
                        </aside>
                    </div>
                </main>
                <footer className="flex-shrink-0 h-16 mt-2 md:mt-4">
                    <StatusLine 
                        latestLog={logs.length > 0 ? logs[logs.length-1] : null}
                        onOpenLog={() => setShowLogModal(true)}
                        onOpenGameMenu={() => setShowGameMenu(true)}
                    >
                        <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
                    </StatusLine>
                </footer>
            </div>
            
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                 <div className="md:hidden fixed inset-0 z-30 flex justify-end" aria-modal="true" role="dialog">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setShowMobileSidebar(false)} />
                    <aside className="relative z-40 w-full max-w-xs bg-bg-default p-4 h-full">
                        <SidebarContent 
                            gameState={gameState}
                            onEnergyChange={onEnergyChange}
                            onToggleRedAlert={onToggleRedAlert}
                            onEvasiveManeuvers={onEvasiveManeuvers}
                            onSelectRepairTarget={onSelectRepairTarget}
                            onToggleCloak={onToggleCloak}
                            onTogglePointDefense={onTogglePointDefense}
                            themeName={themeName}
                        />
                    </aside>
                </div>
            )}
            
            {/* Floating 'Systems' button for touch devices */}
            {isTouchDevice && (
                <div className="md:hidden fixed bottom-20 right-4 z-20">
                    <button
                        onClick={() => setShowMobileSidebar(true)}
                        className="btn btn-secondary rounded-full p-4 aspect-square flex items-center justify-center shadow-lg"
                        aria-label="Open Ship Systems"
                    >
                       <ScienceIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
