import React from 'react';
import Resizer from './Resizer';
import SidebarContent from './SidebarContent';
import SectorView from './SectorView';
import QuadrantView from './QuadrantView';
import WarpAnimation from './WarpAnimation';
import CombatFXLayer from './CombatFXLayer';
import PlayerHUD from './PlayerHUD';
import StatusLine from './StatusLine';
import ThemeSwitcher from './ThemeSwitcher';
import { ScienceIcon } from '../assets/ui/icons';
import { useGameState } from '../contexts/GameStateContext';
import { useUIState } from '../contexts/UIStateContext';
import { useGameActions } from '../contexts/GameActionsContext';

const GameUI: React.FC = () => {
    const { gameState, isWarping, desperationMoveAnimation } = useGameState();
    const { 
        themeName, setTheme, currentView, 
        isResizing, setIsResizing, isTouchDevice,
        bottomPanelHeight, setBottomPanelHeight, 
        sidebarWidth, setSidebarWidth,
        showMobileSidebar, setShowMobileSidebar,
        entityRefs
    } = useUIState();
    const { onSetView, onWarp, onScanQuadrant } = useGameActions();

    const MIN_SIDEBAR_WIDTH = 280;
    const MAX_SIDEBAR_WIDTH = 600;
    const MIN_HUD_HEIGHT = 240;
    const MAX_HUD_HEIGHT = 500;

    const handleHorizontalResize = (movementY: number) => {
        setBottomPanelHeight(prev => Math.max(MIN_HUD_HEIGHT, Math.min(MAX_HUD_HEIGHT, prev - movementY)));
    };
    const handleVerticalResize = (movementX: number) => {
        setSidebarWidth(prev => Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, prev - movementX)));
    };

    if (!gameState) return null;

    const { player, logs, currentSector: sector, redAlert, quadrantMap } = gameState;
    const computerHealthPercent = (player.ship.subsystems.computer.health / player.ship.subsystems.computer.maxHealth) * 100;

    return (
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
                                        disabled={computerHealthPercent < 100}
                                        title={computerHealthPercent < 100 ? "Quadrant Map offline: Computer damaged" : "Quadrant Map"}
                                    >
                                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">Quadrant Map</span>
                                    </button>
                                </div>
                                <div className="relative flex-grow flex justify-center items-center min-h-0">
                                    {isWarping && <WarpAnimation />}
                                    {/* Map Container with shared border and styling */}
                                    <div className="w-full h-full relative border-2 border-border-light rounded-r-md overflow-hidden bg-black">
                                        {currentView === 'sector' ? (
                                            <>
                                                <CombatFXLayer effects={gameState.combatEffects} entities={[player.ship, ...sector.entities]} entityRefs={entityRefs} />
                                                <SectorView isResizing={isResizing} />
                                            </>
                                        ) : (
                                            <QuadrantView
                                                quadrantMap={quadrantMap}
                                                currentSector={sector}
                                                playerPosition={player.position}
                                                playerShip={player.ship}
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
                                <PlayerHUD />
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
                       <SidebarContent />
                    </aside>
                </div>
            </main>
            <footer className="flex-shrink-0 h-16 mt-2 md:mt-4">
                <StatusLine>
                    <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
                </StatusLine>
            </footer>
        
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                 <div className="md:hidden fixed inset-0 z-30 flex justify-end" aria-modal="true" role="dialog">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setShowMobileSidebar(false)} />
                    <aside className="relative z-40 w-full max-w-xs bg-bg-default p-4 h-full">
                        <SidebarContent />
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

export default GameUI;